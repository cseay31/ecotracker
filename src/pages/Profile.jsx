import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, Leaf, Volume2, Bug, Bot, Star, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const BADGE_DEFS = [
  { key: 'Novice Naturalist', icon: Leaf, desc: 'Submit your first observation' },
  { key: 'Invasive Hunter', icon: Bug, desc: 'Identify an invasive species' },
  { key: 'Audio Tracker', icon: Volume2, desc: 'Submit an audio observation' },
  { key: 'Bot Operator', icon: Bot, desc: 'Operate a robot ingestion unit' },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [observations, setObservations] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareObs, setShareObs] = useState(null);
  const [expertEmail, setExpertEmail] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const obs = await base44.entities.Observation.list('-timestamp', 100);
        const mine = obs.filter((o) => o.user_id === u.id || o.created_by_id === u.id);
        setObservations(mine);
      } catch (e) {}
    })();
  }, []);

  const earned = new Set();
  if (observations.length > 0) earned.add('Novice Naturalist');
  if (observations.some((o) => o.is_invasive)) earned.add('Invasive Hunter');
  if (observations.some((o) => o.observation_type === 'audio')) earned.add('Audio Tracker');

  function openShare(obs) {
    setShareObs(obs);
    setExpertEmail('');
    setShareOpen(true);
  }

  async function submitShare() {
    if (!expertEmail || !shareObs) return;
    try {
      await base44.entities.ExpertShare.create({
        observation_id: shareObs.id,
        expert_email: expertEmail,
        date_shared: new Date().toISOString(),
      });
      toast.success('Observation shared with expert.');
      setShareOpen(false);
    } catch (e) {
      toast.error('Could not share: ' + e.message);
    }
  }

  return (
    <AppShell title="Profile">
      <div className="flex-1 p-4 space-y-5 max-w-lg mx-auto w-full">
        <Card className="p-5 text-center space-y-2">
          <div className="text-3xl font-bold">{user?.full_name || user?.email || 'Naturalist'}</div>
          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">
            <Star className="h-4 w-4" /> {user?.points || 0} points
          </div>
        </Card>

        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Award className="h-5 w-5" /> Badges</h2>
          <div className="grid grid-cols-2 gap-3">
            {BADGE_DEFS.map((b) => {
              const has = earned.has(b.key);
              return (
                <Card key={b.key} className={`p-4 flex items-center gap-3 ${has ? 'border-green-500' : 'opacity-50'}`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${has ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{b.key}</div>
                    <div className="text-xs text-muted-foreground">{b.desc}</div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3">My observations ({observations.length})</h2>
          <div className="space-y-2">
            {observations.length === 0 && <p className="text-sm text-muted-foreground">No observations yet. Head to the scanner!</p>}
            {observations.map((o) => (
              <Card key={o.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{o.common_name || o.species_name || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.observation_type === 'audio' ? '🔊' : '🌿'} · {o.confidence_score ?? 0}% · {o.status?.replace(/_/g, ' ')}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => openShare(o)}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share with expert</DialogTitle>
            <DialogDescription>Send this observation to a specialist for review.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="email">Expert email</Label>
            <Input id="email" type="email" value={expertEmail} onChange={(e) => setExpertEmail(e.target.value)} placeholder="expert@university.edu" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)}>Cancel</Button>
            <Button onClick={submitShare} disabled={!expertEmail}>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}