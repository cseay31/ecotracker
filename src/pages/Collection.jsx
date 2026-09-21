import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/AppShell';
import { Image } from '@/components/ui/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, Search, Leaf } from 'lucide-react';
import { RARITY } from '@/lib/speciesData';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

export default function Collection() {
  const [user, setUser] = useState(null);
  const [collected, setCollected] = useState([]); // array of records
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [onlyInvasive, setOnlyInvasive] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!alive) return;
        setUser(u);
        const cols = await base44.entities.SpeciesCollection.filter({ created_by_id: u.id }, '-last_seen_at', 100);
        if (!alive) return;
        setCollected(cols || []);
      } catch (e) {
        toast.error('Could not load your collection.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const uniqueCount = collected.length;
  const totalSightings = collected.reduce((a, c) => a + (c.discovery_count || 1), 0);

  const filtered = useMemo(() => {
    return collected.filter((c) => {
      if (onlyInvasive && !c.is_invasive) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!(`${c.common_name} ${c.scientific_name}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [collected, query, onlyInvasive]);

  if (loading) {
    return (
      <AppShell title="BioDex">
        <div className="flex-1 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      </AppShell>
    );
  }

  return (
    <AppShell title="BioDex">
      <div className="flex-1 p-4 space-y-4 max-w-3xl mx-auto w-full">
        {/* Summary */}
        <Card className="bio-overlay p-4">
          <div className="flex items-center gap-2 mb-1 text-teal-50 font-bold">
            <Leaf className="h-5 w-5 text-emerald-300" /> Your BioDex
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div><span className="text-teal-50 font-bold text-lg">{uniqueCount}</span> <span className="text-teal-300/70">unique species</span></div>
            <div><span className="text-teal-50 font-bold text-lg">{totalSightings}</span> <span className="text-teal-300/70">total sightings</span></div>
          </div>
          <div className="text-teal-300/60 text-xs mt-1">Every unique species grows your diversity score — get back out there and catch more!</div>
        </Card>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-400/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your collection…"
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

        {/* Empty state */}
        {collected.length === 0 && (
          <Card className="bio-overlay p-8 text-center space-y-4">
            <div className="text-5xl">📷</div>
            <div className="text-teal-100 font-semibold">Your BioDex is empty</div>
            <p className="text-teal-300/70 text-sm">Head out, snap photos of wild plants and animals, and build your real-life collection.</p>
            <Button asChild className="bio-contact rounded-full">
              <Link to="/game"><Camera className="h-4 w-4" /> Start scanning</Link>
            </Button>
          </Card>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((c) => {
            const rarity = c.rarity || 'common';
            const color = RARITY[rarity]?.color || RARITY.common.color;
            return (
              <Card key={c.id} className="bio-overlay p-0 overflow-hidden">
                <div className="h-32 w-full bg-teal-950/60 relative">
                  {c.media_url ? (
                    <Image src={c.media_url} alt={c.common_name} className="w-full h-full" fittingType="fill" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-4xl">{c.emoji || '🐾'}</div>
                  )}
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-teal-950" style={{ background: color }}>
                    ×{c.discovery_count || 1}
                  </div>
                  {c.is_invasive && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-pink-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Inv
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <div className="text-teal-50 text-sm font-semibold leading-tight truncate">{c.common_name}</div>
                  {c.scientific_name && <div className="text-teal-300/60 text-[11px] italic truncate">{c.scientific_name}</div>}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] px-1.5 rounded-full" style={{ color, background: `${color}22` }}>{RARITY[rarity]?.label || rarity}</span>
                    {c.best_confidence != null && <span className="text-[10px] text-teal-300/60">{Math.round(c.best_confidence)}%</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}