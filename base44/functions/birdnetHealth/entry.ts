import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Admin-only health probe for the self-hosted BirdNET-Analyzer deployment.
// Runs server-side to avoid browser CORS, with a 15s timeout and an SSRF
// guard blocking private/loopback hosts. Any HTTP response = server is up.

function assertSafeEndpoint(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('endpoint must be http or https');
  }
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost')) throw new Error('localhost not allowed');
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    if (a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
      throw new Error('private/local IP not allowed');
    }
  }
  if (host === '::1' || host === '[::1]') throw new Error('private/local IP not allowed');
  return url;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    let endpoint = (body.endpoint || '').trim();
    if (!endpoint) {
      try {
        const settings = await base44.asServiceRole.entities.SystemSetting.list(1);
        endpoint = (settings[0] && settings[0].bioacoustics_endpoint) || '';
      } catch (e) {}
    }
    if (!endpoint) {
      return Response.json({ ok: false, error: 'No BirdNET endpoint configured', endpoint: '' }, { status: 200 });
    }

    let url;
    try {
      url = assertSafeEndpoint(endpoint);
    } catch (e) {
      return Response.json({ ok: false, error: e.message, endpoint }, { status: 200 });
    }

    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let status = null;
    let error = null;
    try {
      const res = await fetch(url.toString(), { method: 'GET', signal: controller.signal });
      status = res.status;
    } catch (e) {
      error = e.name === 'AbortError' ? 'timeout (15s)' : String(e.message || e);
    } finally {
      clearTimeout(timeout);
    }
    const latency_ms = Date.now() - started;
    return Response.json({
      ok: status !== null && !error,
      status,
      latency_ms,
      error,
      endpoint: url.toString(),
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}