import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Admin-only: aggregates all observation records into a geographic grid to
// surface biodiversity DATA hotspots (dense) and coldspots (data gaps), plus
// summary biodiversity stats. Returns centers + counts for a heatmap-style map.

const PAGE = 500;
const MAX_PAGES = 8; // up to 4000 observations scanned
const GRID_N = 6;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Paginate observations (service role — admin already verified) by
    // created_date descending cursor, deduping by id.
    const seen = new Set();
    const obs = [];
    let cursor;
    for (let i = 0; i < MAX_PAGES; i++) {
      const query = cursor ? { created_date: { $lt: cursor } } : {};
      const batch = await base44.asServiceRole.entities.Observation.filter(query, '-created_date', PAGE);
      if (!batch || batch.length === 0) break;
      for (const o of batch) {
        if (!seen.has(o.id)) {
          seen.add(o.id);
          obs.push(o);
        }
      }
      cursor = batch[batch.length - 1].created_date;
      if (batch.length < PAGE) break;
    }

    // Only observations with usable public coordinates contribute to the grid.
    const geo = obs.filter(
      (o) => typeof o.public_lat === 'number' && typeof o.public_long === 'number'
    );

    const summary = {
      total_observations: obs.length,
      geolocated: geo.length,
      unique_species: new Set(obs.map((o) => o.species_name).filter(Boolean)).size,
      invasive_observations: obs.filter((o) => o.is_invasive).length,
      verified_observations: obs.filter((o) => o.status === 'verified').length,
    };

    if (geo.length === 0) {
      return Response.json({ summary, hotspots: [], coldspots: [], bbox: null });
    }

    // Bounding box over all geolocated observations.
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const o of geo) {
      if (o.public_lat < minLat) minLat = o.public_lat;
      if (o.public_lat > maxLat) maxLat = o.public_lat;
      if (o.public_long < minLng) minLng = o.public_long;
      if (o.public_long > maxLng) maxLng = o.public_long;
    }
    const bbox = { minLat, maxLat, minLng, maxLng };

    const dLat = (maxLat - minLat) / GRID_N || 0.01;
    const dLng = (maxLng - minLng) / GRID_N || 0.01;

    const cells = {}; // key -> { count, species: Set, cLat, cLng }
    for (let r = 0; r < GRID_N; r++) {
      for (let c = 0; c < GRID_N; c++) {
        const key = r + '-' + c;
        cells[key] = {
          count: 0,
          species: new Set(),
          cLat: minLat + dLat * (r + 0.5),
          cLng: minLng + dLng * (c + 0.5),
        };
      }
    }
    for (const o of geo) {
      const r = Math.min(GRID_N - 1, Math.floor((o.public_lat - minLat) / dLat));
      const c = Math.min(GRID_N - 1, Math.floor((o.public_long - minLng) / dLng));
      const cell = cells[r + '-' + c];
      cell.count += 1;
      if (o.species_name) cell.species.add(o.species_name);
    }

    const allCells = Object.values(cells).map((cell) => ({
      lat: cell.cLat,
      lng: cell.cLng,
      count: cell.count,
      unique_species: cell.species.size,
    }));

    const hotspots = allCells
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    // Coldspots = data-gap cells (0 observations) inside the observed bounding box.
    const coldspots = allCells
      .filter((c) => c.count === 0)
      .slice(0, 12);

    return Response.json({ summary, hotspots, coldspots, bbox });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}