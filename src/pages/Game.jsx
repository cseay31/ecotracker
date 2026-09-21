import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, AlertTriangle, Trophy, BookOpen, Loader2, Leaf, Flame } from 'lucide-react';
import { BIOMES, RARITY, SPECIES, TOTAL_DEX } from '@/lib/speciesData';
import { pickEncounter, pointsForNewDiscovery, REPEAT_POINTS, tierForPoints } from '@/lib/gameLogic';

const BIOME_EMOJI = { Forest: "🌲", Wetland: "🪷", Grassland: "🌾", Urban: "🏙️", Coastal: "🏖️", Desert: "🏜️" };

export default function Game() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [collected, setCollected] = useState({}); // species_id -> record
  const [biome, setBiome] = useState('Forest');
  const [encounter, setEncounter] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!alive) return;
        setUser(u);
        const name = u.full_name || u.email || 'Explorer';
        // get-or-create profile
        const existing = await base44.entities.GameProfile.filter({ created_by_id: u.id });
        let p = existing && existing[0];
        if (!p) {
          p = await base44.entities.GameProfile.create({ display_name: name, total_points: 0, unique_species_count: 0, total_sightings: 0, tier: 'Sprout' });
        }
        if (!alive) return;
        setProfile(p);
        const cols = await base44.entities.SpeciesCollection.filter({ created_by_id: u.id });
        if (!alive) return;
        const map = {};
        for (const c of cols) map[c.species_id] = c;
        setCollected(map);
      } catch (e) {
        toast.error('Could not load your game profile.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const collectedIds = useMemo(() => new Set(Object.keys(collected)), [collected]);
  const tier = profile ? tierForPoints(profile.total_points) : { name: 'Sprout', icon: '🌱' };
  const dexProgress = collectedIds.size;

  function explore() {
    const sp = pickEncounter(biome);
    if (!sp) return;
    setEncounter(sp);
    setRevealed(false);
    setReward(null);
  }

  async function discover() {
    if (!encounter || !profile || discovering) return;
    setDiscovering(true);
    try {
      const isNew = !collectedIds.has(encounter.id);
      const pts = isNew ? pointsForNewDiscovery(encounter) : REPEAT_POINTS;
      const now = new Date().toISOString();

      let nextCollected = { ...collected };
      if (isNew) {
        const rec = await base44.entities.SpeciesCollection.create({
          species_id: encounter.id,
          common_name: encounter.common_name,
          scientific_name: encounter.scientific_name,
          taxon_group: encounter.taxon_group,
          biome: encounter.biome,
          rarity: encounter.rarity,
          is_invasive: encounter.is_invasive,
          establishment_means: encounter.establishment_means,
          emoji: encounter.emoji,
          discovery_count: 1,
          first_discovered_at: now,
          last_seen_at: now,
        });
        nextCollected[encounter.id] = rec;
      } else {
        const existing = collected[encounter.id];
        const updated = await base44.entities.SpeciesCollection.update(existing.id, {
          discovery_count: (existing.discovery_count || 1) + 1,
          last_seen_at: now,
        });
        nextCollected[encounter.id] = updated;
      }

      const newUnique = Object.keys(nextCollected).length;
      const newPoints = (profile.total_points || 0) + pts;
      const nextTier = tierForPoints(newPoints).name;
      const updatedProfile = await base44.entities.GameProfile.update(profile.id, {
        total_points: newPoints,
        unique_species_count: newUnique,
        total_sightings: (profile.total_sightings || 0) + 1,
        tier: nextTier,
        last_played: now,
      });

      setCollected(nextCollected);
      setProfile(updatedProfile);
      setReward({ points: pts, isNew, invasive: encounter.is_invasive });
      if (isNew) {
        toast.success(`New species! ${encounter.common_name}  +${pts} pts`);
        if (encounter.is_invasive) toast.warning(`Invasive species — report it to help local ecosystems!`);
      } else {
        toast.success(`Rediscovered ${encounter.common_name}  +${pts} pts`);
      }
      setEncounter(null);
      setRevealed(false);
    } catch (e) {
      toast.error('Could not save discovery: ' + e.message);
    } finally {
      setDiscovering(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="BioDex Game">
        <div className="flex-1 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      </AppShell>
    );
  }

  return (
    <AppShell title="BioDex Game">
      <div className="flex-1 p-4 space-y-5 max-w-2xl mx-auto w-full">
        {/* Profile / HUD */}
        <Card className="bio-overlay p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center text-2xl">{tier.icon}</div>
              <div>
                <div className="text-teal-50 font-bold leading-tight">{profile?.display_name || 'Explorer'}</div>
                <div className="text-teal-300/70 text-xs">Tier: {tier.name}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Points" value={profile?.total_points || 0} icon={Sparkles} />
              <Stat label="Diversity" value={`${dexProgress}/${TOTAL_DEX}`} icon={Leaf} />
              <Stat label="Sightings" value={profile?.total_sightings || 0} icon={Compass} />
            </div>
          </div>
        </Card>

        {/* Biome selector */}
        <div>
          <div className="text-teal-100 font-semibold text-sm mb-2">Choose a biome to explore</div>
          <div className="grid grid-cols-3 gap-2">
            {BIOMES.map((b) => (
              <button
                key={b}
                onClick={() => { setBiome(b); setEncounter(null); setRevealed(false); }}
                className={`rounded-xl px-2 py-3 text-sm font-semibold border transition-colors ${
                  biome === b
                    ? 'bg-emerald-500/25 border-emerald-400 text-teal-50'
                    : 'bg-teal-900/40 border-teal-700/50 text-teal-200/80 hover:bg-teal-800/50'
                }`}
              >
                <div className="text-xl">{BIOME_EMOJI[b]}</div>
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Encounter area */}
        <Card className="bio-overlay p-5 min-h-[280px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!encounter && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                <div className="text-5xl">{BIOME_EMOJI[biome]}</div>
                <div className="text-teal-100 font-semibold">Ready to explore the {biome}?</div>
                <Button className="bio-contact rounded-full px-8" onClick={explore}>
                  <Compass className="h-5 w-5" /> Explore {biome}
                </Button>
              </motion.div>
            )}
            {encounter && !revealed && (
              <motion.div key="mystery" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                <div className="mx-auto h-32 w-32 rounded-2xl bg-teal-950/60 border-2 grid place-items-center text-6xl"
                  style={{ borderColor: RARITY[encounter.rarity].color }}>
                  <span className="opacity-90">❔</span>
                </div>
                <div className="text-teal-200/80 text-sm">A wild species appeared!</div>
                <Button variant="outline" className="rounded-full border-emerald-400 text-emerald-200 hover:bg-emerald-500/15" onClick={() => setRevealed(true)}>
                  <Sparkles className="h-4 w-4" /> Reveal
                </Button>
              </motion.div>
            )}
            {encounter && revealed && (
              <motion.div key="reveal" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="text-center space-y-3 w-full">
                <div className="mx-auto h-32 w-32 rounded-2xl grid place-items-center text-7xl"
                  style={{ background: `${RARITY[encounter.rarity].color}22`, border: `2px solid ${RARITY[encounter.rarity].color}` }}>
                  {encounter.emoji}
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-teal-50 font-bold text-lg">{encounter.common_name}</span>
                  {encounter.is_invasive && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="h-3 w-3" /> INVASIVE
                    </span>
                  )}
                </div>
                <div className="text-teal-300/70 text-xs italic">{encounter.scientific_name}</div>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full" style={{ background: `${RARITY[encounter.rarity].color}22`, color: RARITY[encounter.rarity].color }}>
                    {RARITY[encounter.rarity].label}
                  </span>
                  <span className="text-teal-300/60">{encounter.taxon_group} · {encounter.biome}</span>
                  {collectedIds.has(encounter.id) && <span className="text-teal-400/60">· already in dex</span>}
                </div>
                <p className="text-teal-200/70 text-sm leading-relaxed max-w-md mx-auto">{encounter.blurb}</p>
                <div className="flex gap-2 justify-center pt-1">
                  <Button variant="ghost" className="text-teal-300/70" onClick={() => { setEncounter(null); setRevealed(false); }}>Skip</Button>
                  <Button className="bio-contact rounded-full px-6" disabled={discovering} onClick={discover}>
                    {discovering ? <Loader2 className="h-5 w-5 animate-spin" /> : <Leaf className="h-5 w-5" />}
                    {discovering ? 'Saving...' : 'Discover!'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Reward flash */}
        <AnimatePresence>
          {reward && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-emerald-300 font-bold">
              <Flame className="h-5 w-5" />
              {reward.isNew ? `New discovery +${reward.points} pts!` : `Rediscovered +${reward.points} pts`}
              {reward.invasive && <span className="text-pink-400">· invasive bonus</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick links */}
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1 rounded-full border-teal-600 text-teal-100 hover:bg-teal-700/30">
            <Link to="/collection"><BookOpen className="h-4 w-4" /> Collection</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-full border-teal-600 text-teal-100 hover:bg-teal-700/30">
            <Link to="/leaderboard"><Trophy className="h-4 w-4" /> Leaderboard</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="px-2">
      <Icon className="h-4 w-4 mx-auto text-emerald-300/80" />
      <div className="text-teal-50 font-bold text-base leading-tight">{value}</div>
      <div className="text-teal-300/60 text-[10px] uppercase tracking-wide">{label}</div>
    </div>
  );
}