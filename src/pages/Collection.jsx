import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, Search, Leaf, Filter } from 'lucide-react';
import { SPECIES, BIOMES, RARITY, TOTAL_DEX } from '@/lib/speciesData';

export default function Collection() {
  const [user, setUser] = useState(null);
  const [collected, setCollected] = useState({}); // species_id -> record
  const [loading, setLoading] = useState(true);
  const [biomeFilter, setBiomeFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [onlyInvasive, setOnlyInvasive] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!alive) return;
        setUser(u);
        const cols = await base44.entities.SpeciesCollection.filter({ created_by_id: u.id });
        if (!alive) return;
        const map = {};
        for (const c of cols) map[c.species_id] = c;
        setCollected(map);
      } catch (e) {
        toast.error('Could not load your collection.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const collectedCount = Object.keys(collected).length;
  const progress = Math.round((collectedCount / TOTAL_DEX) * 100);

  const filtered = useMemo(() => {
    return SPECIES.filter((s) => {
      if (biomeFilter !== 'All' && s.biome !== biomeFilter) return false;
      if (onlyInvasive && !s.is_invasive) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!s.common_name.toLowerCase().includes(q) && !s.scientific_name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [biomeFilter, onlyInvasive, query]);

  if (loading) {
    return (
      <AppShell title="Collection">
        <div className="flex-1 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Collection">
      <div className="flex-1 p-4 space-y-4 max-w-3xl mx-auto w-full">
        {/* Progress */}
        <Card className="bio-overlay p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-teal-50 font-bold">
              <Leaf className="h-5 w-5 text-emerald-300" /> Your BioDex
            </div>
            <div className="text-teal-200 text-sm font-semibold">{collectedCount} / {TOTAL_DEX} discovered</div>
          </div>
          <div className="h-3 rounded-full bg-teal-950/60 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-teal-300/60 text-xs mt-1">{progress}% complete · more diversity = more points</div>
        </Card>

        {/* Filters */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-400/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search species..."
                className="bio-input w-full rounded-full pl-9 pr-3 py-2 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOnlyInvasive((v) => !v)}
              className={onlyInvasive ? 'border-pink-400 text-pink-200 bg-pink-500/20' : 'border-teal-600 text-teal-200'}
            >
              <AlertTriangle className="h-4 w-4" /> Invasive
            </Button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 text-teal-400/60 shrink-0" />
            {['All', ...BIOMES].map((b) => (
              <button
                key={b}
                onClick={() => setBiomeFilter(b)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                  biomeFilter === b ? 'bg-emerald-500/25 border-emerald-400 text-teal-50' : 'border-teal-700/50 text-teal-300/70 hover:bg-teal-800/40'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Dex grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((s) => {
            const rec = collected[s.id];
            const has = !!rec;
            return (
              <Card key={s.id} className={`p-3 flex flex-col items-center text-center ${has ? 'bio-overlay' : 'bg-teal-950/40 border-teal-900/60'}`}>
                <div
                  className="h-16 w-16 rounded-xl grid place-items-center text-4xl mb-2"
                  style={has ? { background: `${RARITY[s.rarity].color}22`, border: `2px solid ${RARITY[s.rarity].color}` } : { background: 'rgba(0,0,0,0.3)' }}
                >
                  {has ? s.emoji : '❔'}
                </div>
                <div className={`text-sm font-semibold leading-tight ${has ? 'text-teal-50' : 'text-teal-700'}`}>
                  {has ? s.common_name : '???'}
                </div>
                {has ? (
                  <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">
                    <span className="text-[10px] text-teal-300/70">×{rec.discovery_count || 1}</span>
                    {s.is_invasive && <AlertTriangle className="h-3 w-3 text-pink-400" />}
                    <span className="text-[10px] px-1.5 rounded-full" style={{ color: RARITY[s.rarity].color, background: `${RARITY[s.rarity].color}22` }}>{RARITY[s.rarity].label}</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-teal-700/70 mt-1">{s.taxon_group} · {s.biome}</div>
                )}
              </Card>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center text-teal-300/60 py-10">No species match your filters.</div>
        )}
      </div>
    </AppShell>
  );
}