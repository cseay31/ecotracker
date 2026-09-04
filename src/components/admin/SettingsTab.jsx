import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/adminAudit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const DEFAULT_FLAGS = { photo_gallery: true, forums: true };

export default function SettingsTab() {
  const [setting, setSetting] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [draft, setDraft] = useState(null);

  async function load() {
    try {
      const list = await base44.entities.SystemSetting.list(1);
      const s = list[0] || await base44.entities.SystemSetting.create({ feature_flags: DEFAULT_FLAGS, maintenance_mode: false, rate_limit_per_min: 30 });
      setSetting(s);
      setDraft({ ...s, feature_flags: { ...DEFAULT_FLAGS, ...(s.feature_flags || {}) } });
    } catch (e) { toast.error(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function save(partial, actionLabel) {
    try {
      const updated = await base44.entities.SystemSetting.update(setting.id, partial);
      setSetting(updated);
      setDraft({ ...updated, feature_flags: { ...DEFAULT_FLAGS, ...(updated.feature_flags || {}) } });
      await logAudit(actionLabel, 'SystemSetting');
      toast.success('Settings saved.');
    } catch (e) { toast.error(e.message); }
  }

  function confirmAndApply(action) {
    setConfirm(action);
  }

  async function runConfirmed() {
    const { partial, label } = confirm;
    setConfirm(null);
    await save(partial, label);
  }

  if (!draft) return <div className="text-muted-foreground">Loading settings...</div>;
  const flags = draft.feature_flags || {};

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Feature flags</h3>
        {Object.keys(DEFAULT_FLAGS).map((k) => (
          <div key={k} className="flex items-center justify-between">
            <Label className="capitalize">{k.replace(/_/g, ' ')}</Label>
            <Switch
              checked={!!flags[k]}
              onCheckedChange={(v) => {
                const newFlags = { ...flags, [k]: v };
                setDraft({ ...draft, feature_flags: newFlags });
                confirmAndApply({ partial: { feature_flags: newFlags }, label: `Toggled feature flag ${k} -> ${v}` });
              }}
            />
          </div>
        ))}
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Alert banner</h3>
        <Label>Top-of-page banner text (leave empty to hide)</Label>
        <Input value={draft.top_alert_banner || ''} onChange={(e) => setDraft({ ...draft, top_alert_banner: e.target.value })} placeholder="e.g. Scheduled maintenance Sunday 2-4am" />
        <Button onClick={() => save({ top_alert_banner: draft.top_alert_banner }, 'Updated alert banner')}>Save banner</Button>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Maintenance mode</h3>
        <Textarea value={draft.maintenance_message || ''} onChange={(e) => setDraft({ ...draft, maintenance_message: e.target.value })} placeholder="Message shown during maintenance..." />
        <div className="flex items-center justify-between">
          <Label>Enable maintenance mode</Label>
          <Switch
            checked={!!draft.maintenance_mode}
            onCheckedChange={(v) => {
              setDraft({ ...draft, maintenance_mode: v });
              confirmAndApply({ partial: { maintenance_mode: v, maintenance_message: draft.maintenance_message }, label: `Maintenance mode -> ${v}` });
            }}
          />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Rate limits</h3>
        <Label>Max submissions per user per minute</Label>
        <Input type="number" value={draft.rate_limit_per_min ?? 30} onChange={(e) => setDraft({ ...draft, rate_limit_per_min: Number(e.target.value) })} />
        <Button onClick={() => save({ rate_limit_per_min: draft.rate_limit_per_min }, 'Updated rate limit')}>Save rate limit</Button>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">🤖 Bioacoustics endpoint</h3>
        <p className="text-sm text-muted-foreground">Self-hosted BirdNET/Perch server URL for audio species ID. Leave empty until your server is running — audio observations are still saved, identified as "Unknown".</p>
        <Input value={draft.bioacoustics_endpoint || ''} onChange={(e) => setDraft({ ...draft, bioacoustics_endpoint: e.target.value })} placeholder="https://my-birdnet.example.com/predict" />
        <Button onClick={() => save({ bioacoustics_endpoint: draft.bioacoustics_endpoint }, 'Updated bioacoustics endpoint')}>Save endpoint</Button>
      </Card>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm change</DialogTitle>
            <DialogDescription>This affects the whole app. Proceed?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button onClick={runConfirmed}>Approve &amp; apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}