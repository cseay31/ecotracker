import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/adminAudit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function MembersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [roleTarget, setRoleTarget] = useState(null);

  async function load() {
    try { setUsers(await base44.entities.User.list(500)); } catch (e) {}
  }
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (search && !(`${u.full_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  async function doSuspend() {
    try {
      await base44.entities.User.update(suspendTarget.id, { status: 'suspended', suspension_reason: reason });
      await logAudit(`Suspended user ${suspendTarget.email}: ${reason}`, 'User');
      toast.success('User suspended.');
      setSuspendTarget(null);
      setReason('');
      load();
    } catch (e) { toast.error(e.message); }
  }

  async function unsuspend(u) {
    try {
      await base44.entities.User.update(u.id, { status: 'active', suspension_reason: '' });
      await logAudit(`Reactivated user ${u.email}`, 'User');
      toast.success('User reactivated.');
      load();
    } catch (e) { toast.error(e.message); }
  }

  async function toggleRole(u) {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await base44.entities.User.update(u.id, { role: newRole });
      await logAudit(`Changed role of ${u.email} to ${newRole}`, 'User');
      toast.success(`Role set to ${newRole}.`);
      setRoleTarget(null);
      load();
    } catch (e) { toast.error(e.message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-border rounded px-3 py-2 text-sm bg-card">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground border-b bg-muted/40">
            <tr><th className="p-3">Member</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Points</th><th className="p-3">Joined</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} className="p-4 text-muted-foreground">No members.</td></tr>}
            {filtered.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-3"><div className="font-medium">{u.full_name || '—'}</div><div className="text-xs text-muted-foreground">{u.email}</div></td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-muted'}`}>{u.role}</span></td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${u.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{u.status}</span></td>
                <td className="p-3">{u.points || 0}</td>
                <td className="p-3 text-xs">{u.created_date ? new Date(u.created_date).toLocaleDateString() : '-'}</td>
                <td className="p-3 space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setRoleTarget(u)}>Toggle role</Button>
                  {u.status === 'suspended' ? (
                    <Button size="sm" variant="outline" onClick={() => unsuspend(u)}>Reactivate</Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => setSuspendTarget(u)}>Suspend</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!suspendTarget} onOpenChange={(o) => !o && setSuspendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend member</DialogTitle>
            <DialogDescription>Provide a reason for suspending {suspendTarget?.email}. This will block their access.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Suspension reason</Label>
            <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Repeated guideline violations..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doSuspend} disabled={!reason.trim()}>Confirm suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!roleTarget} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>Set {roleTarget?.email}'s role to {roleTarget?.role === 'admin' ? 'user' : 'admin'}?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)}>Cancel</Button>
            <Button onClick={() => toggleRole(roleTarget)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}