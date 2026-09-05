import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Markdown-for-Agents content negotiation endpoint.
// Returns a markdown representation of the site with Content-Type: text/markdown,
// Vary: Accept, and an x-markdown-tokens estimate. HTML remains the default for
// browsers on the main app routes; this endpoint serves the machine-readable variant
// referenced via <link rel="alternate" type="text/markdown"> in index.html.

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function mdResponse(markdown, status = 200) {
  return new Response(markdown, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'x-markdown-tokens': String(estimateTokens(markdown)),
      'content-signal': 'ai-train=yes, search=yes, ai-input=yes',
      'Cache-Control': 'public, max-age=300',
      Link: [
        '</.well-known/api-catalog>; rel="api-catalog"',
        '</.well-known/mcp.json>; rel="service-desc"',
        '</connect>; rel="service-doc"',
        '</.well-known/agent-card.json>; rel="describedby"',
      ].join(', '),
    },
  });
}

// Never expose precise coordinates in the machine-readable feed — only the fuzzed
// public coordinates, matching the app's privacy posture for non-admin access.
function publicObs(o) {
  return {
    id: o.id,
    type: o.observation_type,
    species_name: o.species_name,
    common_name: o.common_name,
    confidence_score: o.confidence_score,
    status: o.status,
    is_invasive: o.is_invasive,
    lat: o.public_lat,
    long: o.public_long,
    timestamp: o.timestamp,
  };
}

function renderMarkdown({ recent, watchlist, announcements }) {
  const lines = [];
  lines.push('---');
  lines.push('title: EcoTracker — Community Biodiversity Monitoring');
  lines.push('description: Identify plants and animals with AI, map your local wildlife, and contribute to community conservation efforts.');
  lines.push('image: https://ecotracking.base44.app/og-cover.png');
  lines.push('---');
  lines.push('');
  lines.push('# EcoTracker');
  lines.push('');
  lines.push('EcoTracker is a community biodiversity platform. Identify species from a photo or audio recording, map observations, and track invasive threats. The interactive map and recent observations are public; scanning and a personal profile require a free account.');
  lines.push('');
  lines.push('Site sections:');
  lines.push('- `/` — Splash overview');
  lines.push('- `/map` — Public interactive observation map (no login)');
  lines.push('- `/scanner` — AI image & audio identification (login required)');
  lines.push('- `/profile` — Your observations & achievements (login required)');
  lines.push('- `/about` — About the project');
  lines.push('- `/contact` — Contact the team');
  lines.push('- `/connect` — Connect an AI assistant via MCP');
  lines.push('');
  lines.push('## Recent observations');
  if (recent.length === 0) {
    lines.push('_No observations yet._');
  } else {
    for (const o of recent) {
      const p = publicObs(o);
      const name = p.common_name || p.species_name || 'Unknown';
      lines.push(`- **${name}** (${p.type}) — confidence ${p.confidence_score ?? 0}%, status ${p.status}${p.is_invasive ? ', ⚠ invasive' : ''}${p.lat != null ? `, near ${p.lat},${p.long}` : ''}`);
    }
  }
  lines.push('');
  lines.push('## Invasive species watchlist');
  if (watchlist.length === 0) {
    lines.push('_Watchlist is empty._');
  } else {
    for (const w of watchlist) {
      lines.push(`- **${w.species_name}**${w.common_name ? ` (${w.common_name})` : ''}${w.region ? ` — ${w.region}` : ''}`);
    }
  }
  lines.push('');
  lines.push('## Active announcements');
  if (announcements.length === 0) {
    lines.push('_No active announcements._');
  } else {
    for (const a of announcements) {
      lines.push(`- **${a.title}**${a.priority === 'urgent' ? ' (urgent)' : ''}: ${a.body}`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('Markdown served via content negotiation (`Accept: text/markdown`). See `/connect` for MCP server details.');
  return lines.join('\n');
}

export default async function (req) {
  try {
    const accept = req.headers.get('accept') || '';
    // Serve markdown to agents that ask for it, and also when fetched directly via
    // the alternate link (which may send a generic Accept). HTML stays the default
    // on the main app routes handled by the SPA.
    const base44 = createClientFromRequest(req);

    let recent = [];
    let watchlist = [];
    let announcements = [];
    try {
      recent = await base44.entities.Observation.list('-timestamp', 10);
    } catch (e) {}
    try {
      watchlist = await base44.entities.InvasiveWatchlist.list();
    } catch (e) {}
    try {
      announcements = await base44.entities.Announcement.filter({ is_active: true });
    } catch (e) {}

    void accept;
    const markdown = renderMarkdown({ recent, watchlist, announcements });
    return mdResponse(markdown);
  } catch (error) {
    return mdResponse(`# Error\n\n${error.message}`, 500);
  }
}