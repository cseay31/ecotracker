import React, { useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/AppShell';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, Sparkles, AlertTriangle, Trophy, BookOpen, Loader2, Leaf, Flame, MapPin, Compass, ScanLine } from 'lucide-react';
import { RARITY } from '@/lib/speciesData';
import { pointsForRealDiscovery, REPEAT_POINTS, tierForPoints, collectionFromObservation } from '@/lib/gameLogic';

export default function Game() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [collected, setCollected] = useState({}); // species_id -> record
  const [coords, setCoords] = useState(null);
  const [privateProp, setPrivateProp] = useState(false);
  const [obs, setObs] = useState(null); // identification result observation
  const [revealed, setRevealed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition) {
        } else {
          navigator.geolocation.getCurrentPosition(
            (pos) => { if (alive) setCoords({ lat: pos.coords.latitude, long: pos.coords.longitude }); },
            () => { /* non-fatal */ }
          );
        }
        const u = await base44.auth.me();
        if (!alive) return;
        setUser(u);
        const name = u.full_name || u.email || 'Explorer';
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

  async function onPickFile(file) {
    if (!file) return;
    if (!coords) {
      toast.error('Waiting for your GPS location…');
      return;
    }
    setProcessing(true);
    setObs(null);
    setRevealed(false);
    setReward(null);
    try {
      const up = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke('identifyImage', {
        file_url: up.file_url,
        exact_lat: coords.lat,
        exact_long: coords.long,
        private_property: privateProp,
      });
      setObs(res.data.observation);
    } catch (e) {
      toast.error('Identification failed: ' + e.message);
    } finally {
      setProcessing(false);
    }
  }

  async function discover() {
    if (!obs || !profile || discovering) return;
    setDiscovering(true);
    try {
      const entry = collectionFromObservation(obs);
      const isNew = !collectedIds.has(entry.species_id);
      const pts = isNew ? pointsForRealDiscovery({ rarity: entry.rarity, is_invasive: entry.is_invasive }) : REPEAT_POINTS;
      const now = new Date().toISOString();

      let nextCollected = { ...collected };
      if (isNew) {
        const rec = await base44.entities.SpeciesCollection.create({
          ...entry,
          media_url: obs.media_url,
          best_confidence: obs.confidence_score,
          discovery_count: 1,
          first_discovered_at: now,
          last_seen_at: now,
        });
        nextCollected[entry.species_id] = rec;
      } else {
        const existing = collected[entry.species_id];
        const updated = await base44.entities.SpeciesCollection.update(existing.id, {
          discovery_count: (existing.discovery_count || 1) + 1,
          last_seen_at: now,
          media_url: obs.media_url || existing.media_url,
          best_confidence: Math.max(existing.best_confidence || 0, obs.confidence_score || 0),
        });
        nextCollected[entry.species_id] = updated;
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
      setReward({ points: pts, isNew, invasive: entry.is_invasive, name: entry.common_name });
      if (isNew) {
        toast.success(`New species! ${entry.common_name}  +${pts} pts`);
        if (entry.is_invasive) toast.warning('Invasive species — report it to help local ecosystems!');
      } else {
        toast.success(`Rediscovered ${entry.common_name}  +${pts} pts`);
      }
      setObs(null);
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
        {/* HUD */}
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
              <Stat label="Diversity" value={collectedIds.size} icon={Leaf} />
              <Stat label="Sightings" value={profile?.total_sightings || 0} icon={Compass} />
            </div>
          </div>
        </Card>

        {/* Camera capture */}
        <Card className="bio-overlay p-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files[0];
              e.target.value = '';
              if (f) onPickFile(f);
            }}
          />
          <div className="flex items-center gap-2 text-teal-200/80 text-sm mb-3">
            <MapPin className="h-4 w-4 text-emerald-300" />
            {coords ? `${coords.lat.toFixed(4)}, ${coords.long.toFixed(4)}` : 'Locating…'}
          </div>
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="priv" className="text-sm text-teal-100">Private property (fuzz my location)</Label>
            <Switch id="priv" checked={privateProp} onCheckedChange={setPrivateProp} />
          </div>
          <Button
            className="bio-contact w-full h-24 text-lg rounded-2xl"
            disabled={processing || !coords}
            onClick={() => fileInputRef.current?.click()}
          >
            {processing ? <Loader2 className="h-7 w-7 animate-spin" /> : <Camera className="h-7 w-7" />}
            {processing ? 'Scanning the wild…' : 'Snap a wild species'}
          </Button>
          <p className="text-teal-300/60 text-xs mt-2 text-center">
            Point your camera at any plant or animal — we'll identify it and add it to your BioDex.
          </p>
        </Card>

        {/* Encounter / reveal */}
        <AnimatePresence>
          {obs && (
            <motion.div key="reveal" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="bio-overlay p-5 min-h-[200px]">
                {!revealed ? (
                  <div className="flex flex-col items-center gap-4 py-2">
                    <div className="text-teal-100 font-semibold flex items-center gap-2">
                      <ScanLine className="h-5 w-5 animate-pulse text-emerald-300" /> A wild species was found!
                    </div>
                    <div className="mx-auto h-44 w-44 rounded-2xl overflow-hidden bg-teal-950/60 border-2 border-emerald-400">
                      <Image src={obs.media_url} alt="mystery species" className="w-full h-full blur-xl scale-110" fittingType="fill" />
                    </div>
                    <Button variant="outline" className="rounded-full border-emerald-400 text-emerald-200 hover:bg-emerald-500/15" onClick={() => setRevealed(true)}>
                      <Sparkles className="h-4 w-4" /> Reveal
                    </Button>
                  </div>
                ) : (
                  <motion.div initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-3">
                    <div className="mx-auto h-52 w-full max-w-xs rounded-2xl overflow-hidden border-2"
                      style={{ borderColor: RARITY[(collectionFromObservation(obs).rarity)].color }}>
                      <Image src={obs.media_url} alt={obs.common_name || 'species'} className="w-full h-full" fittingType="fill" />
                    </div>
                    {(() => {
                      const entry = collectionFromObservation(obs);
                      return (
                        <div className="text-center space-y-1">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <span className="text-teal-50 font-bold text-lg">{entry.common_name}</span>
                            {entry.is_invasive && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="h-3 w-3" /> INVASIVE
                              </span>
                            )}
                          </div>
                          {entry.scientific_name && <div className="text-teal-300/70 text-xs italic">{entry.scientific_name}</div>}
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-full" style={{ background: `${RARITY[entry.rarity].color}22`, color: RARITY[entry.rarity].color }}>
                              {RARITY[entry.rarity].label}
                            </span>
                            <span className="text-teal-300/70">Confidence: {Math.round(obs.confidence_score || 0)}%</span>
                            {collectedIds.has(entry.species_id) && <span className="text-teal-400/70">· already in dex</span>}
                          </div>
                          <div className="text-teal-300/60 text-xs capitalize">Establishment: {obs.establishment_means || 'unknown'}</div>
                        </div>
                      );
                    })()}
                    <div className="flex gap-2 justify-center pt-2">
                      <Button variant="ghost" className="text-teal-300/70" onClick={() => { setObs(null); setRevealed(false); }}>Release</Button>
                      <Button className="bio-contact rounded-full px-6" disabled={discovering} onClick={discover}>
                        {discovering ? <Loader2 className="h-5 w-5 animate-spin" /> : <Leaf className="h-5 w-5" />}
                        {discovering ? 'Saving…' : 'Add to BioDex'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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

        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1 rounded-full border-teal-600 text-teal-100 hover:bg-teal-700/30">
            <Link to="/collection"><BookOpen className="h-4 w-4" /> BioDex</Link>
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