import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

// WebMCP: exposes EcoTracker's key actions to AI agents running in the browser via
// navigator.modelContext.registerTool(). Tools are registered on page load and
// unregistered via an AbortController when the app unloads.

const TOOLS = [
  {
    name: 'search_observations',
    title: 'Search observations',
    description:
      'Search EcoTracker biodiversity observations by species or common name. Returns up to 20 matches with species, confidence, status, invasive flag, and approximate (public) coordinates.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Species or common name to search for' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_observation',
    title: 'Get observation',
    description: 'Fetch a single EcoTracker observation by id (public coordinates only).',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'list_invasive_species',
    title: 'List invasive species',
    description: 'List species on the EcoTracker invasive species watchlist.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_announcements',
    title: 'Get announcements',
    description: 'Get active EcoTracker platform announcements.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'navigate',
    title: 'Navigate app',
    description:
      'Navigate the EcoTracker app to a page: splash, map, scanner, about, or contact.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'string', enum: ['splash', 'map', 'scanner', 'about', 'contact'] },
      },
      required: ['page'],
    },
  },
];

const sanitizeObs = (o) => {
  if (!o) return null;
  const { exact_lat, exact_long, ...rest } = o;
  return rest;
};

export default function WebMcpTools() {
  const navigate = useNavigate();

  useEffect(() => {
    const mc = navigator.modelContext;
    if (!mc || typeof mc.registerTool !== 'function') return;

    const controller = new AbortController();

    const parseArgs = (a) => {
      if (a == null) return {};
      if (typeof a === 'string') {
        try {
          return a ? JSON.parse(a) : {};
        } catch {
          return {};
        }
      }
      return a;
    };

    const executors = {
      search_observations: async (raw) => {
        const { query } = parseArgs(raw);
        const q = String(query || '').trim().toLowerCase();
        const list = await base44.entities.Observation.list('-timestamp', 20);
        const filtered = q
          ? list.filter(
              (o) =>
                (o.common_name || '').toLowerCase().includes(q) ||
                (o.species_name || '').toLowerCase().includes(q)
            )
          : list;
        return filtered.map(sanitizeObs);
      },
      get_observation: async (raw) => {
        const { id } = parseArgs(raw);
        if (!id) return { error: 'id is required' };
        const o = await base44.entities.Observation.get(id);
        return sanitizeObs(o);
      },
      list_invasive_species: async () => {
        return await base44.entities.InvasiveWatchlist.list();
      },
      get_announcements: async () => {
        return await base44.entities.Announcement.filter({ is_active: true });
      },
      navigate: async (raw) => {
        const { page } = parseArgs(raw);
        const paths = {
          splash: '/',
          map: '/map',
          scanner: '/scanner',
          about: '/about',
          contact: '/contact',
        };
        const p = paths[page];
        if (!p) return { error: 'unknown page' };
        navigate(p);
        return { ok: true, navigated_to: p };
      },
    };

    for (const t of TOOLS) {
      try {
        mc.registerTool({
          name: t.name,
          title: t.title,
          description: t.description,
          inputSchema: t.inputSchema,
          execute: (args) => executors[t.name](args),
          signal: controller.signal,
        });
      } catch (e) {
        // ignore individual registration failures
      }
    }

    return () => controller.abort();
  }, [navigate]);

  return null;
}