import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/adminAudit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ModerationTab() {
  const [flags, setFlags] = useState([]);

  async function load() {
    try { setFlags(await base44.entities.ModerationFlag.filter({ status: 'pending' })); } catch (e) {}
  }
  useEffect(() => { load(); }, []);

  async function actOn(f, status) {
    try {
      await base44.entities.ModerationFlag.update(f.id, { status });
      await logAudit(`${status === 'actioned' ? 'Actioned' : 'Dismissed'} flag ${f.id} on ${f.target_type}`, 'ModerationFlag');
      toast.success(`Flag ${status}.`);
      load();
    } catch (e) { toast.error(e.message); }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-1">Moderation queue</h3>
        <p className="text-sm text-muted-foreground mb-4">Review member-submitted reports for observations, comments, and users.</p>
        <div className="space-y-3">
          {flags.length === 0 && <p className="text-sm text-muted-foreground">No pending flags. 🎉</p>}
          {flags.map((f) => (
            <div key={f.id} className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">{f.target_type} · #{f.target_id}</div>
                <div className="text-sm">{f.reason}</div>
                <div className="text-xs text-muted-foreground">{f.created_date ? new Date(f.created_date).toLocaleString() : ''}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => actOn(f, 'dismissed')}>Dismiss</Button>
                <Button size="sm" variant="destructive" onClick={() => actOn(f, 'actioned')}>Action</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}