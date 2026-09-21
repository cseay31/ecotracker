import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Trophy, Crown, Leaf } from 'lucide-react';
import { tierForPoints } from '@/lib/gameLogic';

const PODIUM = ['from-yellow-400 to-amber-500', 'from-slate-300 to-slate-400', 'from-amber-700 to-amber-800'];

export default function Leaderboard() {
  const [profiles, setProfiles] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [list, u] = await Promise.all([
          base44.entities.GameProfile.list('-total_points', 50),
          base44.auth.me().catch(() => null),
        ]);
        if (!alive) return;
        setProfiles(list || []);
        setMe(u);
      } catch (e) {
        toast.error('Could not load leaderboard.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <AppShell title="Leaderboard">
        <div className="flex-1 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Leaderboard">
      <div className="flex-1 p-4 space-y-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 text-teal-50 font-bold text-lg">
          <Trophy className="h-5 w-5 text-amber-300" /> Global Leaderboard
        </div>
        <p className="text-teal-300/70 text-sm -mt-2">Ranked by total points — earned by discovering more biodiversity.</p>

        {profiles.length === 0 && (
          <Card className="bio-overlay p-8 text-center text-teal-300/70">No players yet. Be the first — start exploring!</Card>
        )}

        {/* Podium */}
        {profiles.length >= 1 && (
          <div className="grid grid-cols-3 gap-2 items-end">
            {[1, 0, 2].map((idx) => {
              const p = profiles[idx];
              if (!p) return <div key={idx} />;
              const tier = tierForPoints(p.total_points || 0);
              const h = idx === 0 ? 'h-28' : idx === 1 ? 'h-20' : 'h-16';
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="text-3xl mb-1">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                  <div className={`w-full ${h} rounded-t-xl bg-gradient-to-b ${PODIUM[idx]} grid place-items-center text-center px-1`}>
                    <div>
                      <div className="text-teal-950 font-bold text-xs truncate">{p.display_name}</div>
                      <div className="text-teal-950/80 text-[10px]">{p.total_points || 0} pts</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div className="space-y-2">
          {profiles.map((p, i) => {
            const tier = tierForPoints(p.total_points || 0);
            const isMe = me && p.created_by_id === me.id;
            return (
              <Card key={p.id} className={`p-3 flex items-center gap-3 ${isMe ? 'bio-contact border-emerald-400' : 'bio-overlay'}`}>
                <div className={`w-8 text-center font-bold ${i < 3 ? 'text-amber-300' : 'text-teal-300/70'}`}>{i + 1}</div>
                <div className="text-2xl">{tier.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold truncate ${isMe ? 'text-white' : 'text-teal-50'}`}>
                    {p.display_name}{isMe && ' (you)'}
                  </div>
                  <div className="text-xs text-teal-300/70">{tier.name} · {p.unique_species_count || 0} species</div>
                </div>
                <div className={`font-bold ${isMe ? 'text-white' : 'text-emerald-300'}`}>{p.total_points || 0}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}