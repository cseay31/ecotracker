// Shared identification + privacy helpers used across backend functions.

// Only allow outbound fetches to trusted file-storage hosts. Prevents SSRF via
// caller-controlled file_url values pointing at internal IPs / metadata endpoints.
const ALLOWED_FILE_HOST_SUFFIXES = ['.base44.com', '.base44.app', '.wixstatic.com'];

export function assertSafeFileUrl(fileUrl) {
  let url;
  try {
    url = new URL(fileUrl);
  } catch {
    throw new Error('invalid file_url');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('unsupported file_url scheme');
  }
  const host = url.hostname.toLowerCase();
  if (!ALLOWED_FILE_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new Error('untrusted file_url host');
  }
  return fileUrl;
}

export function fuzzCoordinates(lat, long, privateProperty) {
  if (privateProperty) return { public_lat: null, public_long: null };
  return {
    public_lat: Math.round(lat * 100) / 100,
    public_long: Math.round(long * 100) / 100,
  };
}

export async function checkInvasive(base44, speciesName, establishmentMeans) {
  const isIntroduced = establishmentMeans === 'introduced';
  let onWatchlist = false;
  if (speciesName && speciesName !== 'Unknown') {
    try {
      const matches = await base44.asServiceRole.entities.InvasiveWatchlist.filter({ species_name: speciesName });
      onWatchlist = matches.length > 0;
    } catch (e) {
      onWatchlist = false;
    }
  }
  return { is_invasive: isIntroduced || onWatchlist, onWatchlist };
}

// Fetch with a hard timeout so an unofficial/throttled upstream can't hang the
// whole identification request. On abort it throws, letting callers fall back.
async function fetchWithTimeout(url, opts = {}, ms = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// Primary location-tuned iNaturalist Computer Vision identification. The CV
// endpoint is unofficial and can throttle/drop connections, so every step is
// time-bounded; on any failure we return "Unknown" so the secondary model runs.
export async function primaryImageIdentification(file_url, lat, long) {
  try {
    const imgRes = await fetchWithTimeout(assertSafeFileUrl(file_url), {}, 15000);
    const blob = await imgRes.blob();
    const form = new FormData();
    form.append('image', blob, 'observation.jpg');
    if (lat != null) form.append('lat', String(lat));
    if (long != null) form.append('lng', String(long));
    const res = await fetchWithTimeout(
      'https://api.inaturalist.org/v1/computervision/score_image',
      { method: 'POST', body: form },
      20000
    );
    const contentType = res.headers.get('content-type') || '';
    let data = { results: [] };
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      return { species_name: 'Unknown', common_name: '', confidence_score: 0, establishment_means: 'unknown' };
    }
    const results = data.results || [];
    if (results.length === 0) {
      return { species_name: 'Unknown', common_name: '', confidence_score: 0, establishment_means: 'unknown' };
    }
    const top = results[0];
    return {
      species_name: top.taxon.name || 'Unknown',
      common_name: top.taxon.preferred_common_name || '',
      confidence_score: Math.round(top.combined_score || 0),
      establishment_means: top.taxon.establishment_means || 'unknown',
    };
  } catch (e) {
    return { species_name: 'Unknown', common_name: '', confidence_score: 0, establishment_means: 'unknown' };
  }
}

// Secondary fallback: built-in AI vision model.
export async function secondaryImageIdentification(base44, file_url) {
  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        'You are a biodiversity expert. Identify the species in this photo. Respond with the scientific species_name, common_name, and a confidence score from 0 to 100 reflecting how certain you are.',
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          species_name: { type: 'string' },
          common_name: { type: 'string' },
          confidence: { type: 'number' },
        },
      },
    });
    return {
      species_name: result.species_name || 'Unknown',
      common_name: result.common_name || '',
      confidence_score: Math.round(result.confidence || 0),
    };
  } catch (e) {
    return { species_name: 'Unknown', common_name: '', confidence_score: 0 };
  }
}

// Once a species is identified, look up its establishment means at the
// observation's location from iNaturalist: reverse-geocode the coordinates to a
// state/country name (BigDataCloud, free, no key) -> iNaturalist place id ->
// taxa autocomplete with preferred_place_id, which returns establishment_means.
// Returns 'unknown' on any failure so the identification still completes.
const VALID_ESTABLISHMENT_MEANS = ['native', 'introduced', 'endemic', 'unknown'];

// Retry a JSON GET a few times — the establishment-means chain spans two free,
// unauthenticated APIs (BigDataCloud + iNaturalist) that transiently drop or
// throttle requests, which was leaving observations tagged "unknown".
async function fetchJsonRetry(url, ms, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetchWithTimeout(url, {}, ms);
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data) return data;
      }
    } catch (e) {
      // fall through to retry
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 400 * (i + 1)));
  }
  return null;
}

export async function fetchEstablishmentMeans(species_name, lat, long) {
  if (!species_name || species_name === 'Unknown') return 'unknown';
  if (lat == null || long == null) return 'unknown';
  try {
    const geo = await fetchJsonRetry(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`,
      10000
    );
    const candidates = [geo && geo.principalSubdivision, geo && geo.countryName].filter(Boolean);
    let placeId = null;
    for (const name of candidates) {
      const pr = await fetchJsonRetry(
        `https://api.inaturalist.org/v1/places/autocomplete?q=${encodeURIComponent(name)}&per_page=1`,
        10000
      );
      placeId = pr && pr.results && pr.results[0] && pr.results[0].id;
      if (placeId) break;
    }
    if (!placeId) return 'unknown';
    const tr = await fetchJsonRetry(
      `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(species_name)}&preferred_place_id=${placeId}&per_page=1`,
      10000
    );
    const t = tr && tr.results && tr.results[0];
    const means = (t && t.establishment_means && t.establishment_means.establishment_means) || (t && t.preferred_establishment_means);
    return VALID_ESTABLISHMENT_MEANS.includes(means) ? means : 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

// Bioacoustic identification via a self-hosted BirdNET-Analyzer server (free, open source,
// no secondary model). The admin runs `python -m birdnet_analyzer.server` and sets the
// server base URL in app settings. Protocol: POST {base}/analyze with multipart fields
// `audio` (file) + `meta` (JSON string of lat/lon/sensitivity/...). Response:
// {"msg":"success","results":[["Turdus_migratorius", 0.93], ...]}. Until a server is
// configured, audio observations are still stored but identified as "Unknown".
export async function bioacousticIdentification(base44, file_url, lat, long, endpoint) {
  if (!endpoint) {
    return { species_name: 'Unknown', common_name: '', confidence_score: 0, degraded: true, error: 'endpoint_not_configured' };
  }
  try {
    const audioRes = await fetch(assertSafeFileUrl(file_url));
    const blob = await audioRes.blob();
    const fname = (file_url.split('/').pop() || 'recording.wav').split('?')[0] || 'recording.wav';
    const meta = {
      lat: lat != null ? lat : -1,
      lon: long != null ? long : -1,
      week: -1,
      overlap: 0.0,
      sensitivity: 1.0,
      sf_thresh: 0.03,
      pmode: 'avg',
      num_results: 5,
      save: false,
    };
    const form = new FormData();
    form.append('audio', blob, fname);
    form.append('meta', JSON.stringify(meta));
    const url = endpoint.endsWith('/analyze') ? endpoint : endpoint.replace(/\/$/, '') + '/analyze';
    const res = await fetch(url, { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    const results = Array.isArray(data.results) ? data.results : [];
    if (results.length === 0) {
      const msg = (data && data.msg) || 'no_results';
      return { species_name: 'Unknown', common_name: '', confidence_score: 0, degraded: true, error: msg };
    }
    const top = results[0];
    const speciesRaw = Array.isArray(top) ? top[0] : (top.species || top.name || '');
    const score = Array.isArray(top) ? top[1] : (top.confidence || top.score || 0);
    const species_name = String(speciesRaw || 'Unknown').replace(/_/g, ' ').trim() || 'Unknown';
    return {
      species_name,
      common_name: '',
      confidence_score: Math.round(Math.min(1, Math.max(0, Number(score) || 0)) * 100),
      degraded: false,
    };
  } catch (e) {
    return { species_name: 'Unknown', common_name: '', confidence_score: 0, degraded: true, error: String(e) };
  }
}

// Full image identification flow: primary -> conditional secondary fallback,
// then query iNaturalist for the establishment means of the settled species.
export async function runImageIdentification(base44, file_url, lat, long) {
  const primary = await primaryImageIdentification(file_url, lat, long);
  let species_name = primary.species_name;
  let common_name = primary.common_name;
  let confidence_score = primary.confidence_score;
  let establishment_means = primary.establishment_means;

  let status = 'flagged_for_review';
  let points = 0;
  let flag_reason = null;

  if (confidence_score >= 70) {
    status = 'verified';
  } else {
    const sec = await secondaryImageIdentification(base44, file_url);
    if (sec.confidence_score >= 70) {
      species_name = sec.species_name || species_name;
      common_name = sec.common_name || common_name;
      confidence_score = sec.confidence_score;
      status = 'unverified';
    } else {
      flag_reason = 'Low confidence from both identification models';
    }
  }

  // Once the species is settled, query iNaturalist for its establishment means
  // at the observation's location; overrides the primary/secondary guess.
  const em = await fetchEstablishmentMeans(species_name, lat, long);
  if (em !== 'unknown') establishment_means = em;

  const { is_invasive } = await checkInvasive(base44, species_name, establishment_means);
  if (status === 'verified') points = 10 + (is_invasive ? 5 : 0);
  else if (status === 'unverified') points = 5;

  return {
    species_name,
    common_name,
    establishment_means,
    is_invasive,
    confidence_score,
    status,
    flag_reason,
    points,
  };
}

// Full audio identification flow.
export async function runAudioIdentification(base44, file_url, lat, long, endpoint) {
  const bio = await bioacousticIdentification(base44, file_url, lat, long, endpoint);
  let species_name = bio.species_name;
  let common_name = bio.common_name;
  let confidence_score = bio.confidence_score;

  // Query iNaturalist for the identified species' establishment means at the
  // observation's location.
  const establishment_means = await fetchEstablishmentMeans(species_name, lat, long);
  const { is_invasive } = await checkInvasive(base44, species_name, establishment_means);

  let status = 'unverified';
  let points = 0;
  if (confidence_score >= 70) {
    status = 'verified';
    points = 10 + (is_invasive ? 5 : 0);
  }
  return {
    species_name,
    common_name,
    establishment_means,
    is_invasive,
    confidence_score,
    status,
    flag_reason:
      bio.degraded && species_name === 'Unknown'
        ? bio.error === 'endpoint_not_configured'
          ? 'BirdNET endpoint not configured'
          : `BirdNET identification failed: ${bio.error || 'unknown'}`
        : null,
    points,
  };
}

export async function awardPoints(base44, userId, points) {
  if (!points || points <= 0) return;
  try {
    const u = await base44.asServiceRole.entities.User.get(userId);
    const current = (u && (u.points || 0)) || 0;
    await base44.asServiceRole.entities.User.update(userId, { points: current + points });
  } catch (e) {
    // best effort
  }
}

export function buildObservationRecord(opts) {
  const {
    observation_type,
    media_url,
    exact_lat,
    exact_long,
    private_property,
    identification,
    user_id,
  } = opts;
  const { public_lat, public_long } = fuzzCoordinates(exact_lat, exact_long, private_property);
  return {
    observation_type,
    media_url,
    exact_lat,
    exact_long,
    public_lat,
    public_long,
    timestamp: new Date().toISOString(),
    species_name: identification.species_name,
    common_name: identification.common_name,
    establishment_means: identification.establishment_means,
    is_invasive: identification.is_invasive,
    confidence_score: identification.confidence_score,
    status: identification.status,
    flag_reason: identification.flag_reason,
    sync_status: 'synced',
    user_id,
  };
}