import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/adminAudit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function MessagingTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal', show_as_popup: false });
  const [respondTo, setRespondTo] = useState(null);
  const [response, setResponse] = useState('');
  const [annMore, setAnnMore] = useState(true);
  const [inqMore, setInqMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  async function load() {
    try {
      const a = await base44.entities.Announcement.list('-created_date', 20);
      setAnnouncements(a);
      setAnnMore(a.length === 20);
    } catch (e) {}
    try {
      const i = await base44.entities.AdminInquiry.list('-created_date', 20);
      setInquiries(i);
      setInqMore(i.length === 20);
    } catch (e) {}
  }
  useEffect(() => { load(); }, []);

  async function loadMoreAnn() {
    setLoadingMore(true);
    try {
      const cursor = announcements[announcements.length - 1]?.created_date;
      const a = await base44.entities.Announcement.filter(
        cursor ? { created_date: { $lt: cursor } } : {},
        '-created_date',
        20
      );
      setAnnouncements((prev) => [...prev, ...a]);
      setAnnMore(a.length === 20);
    } catch (e) {} finally { setLoadingMore(false); }
  }
  async function loadMoreInq() {
    setLoadingMore(true);
    try {
      const cursor = inquiries[inquiries.length - 1]?.created_date;
      const i = await base44.entities.AdminInquiry.filter(
        cursor ? { created_date: { $lt: cursor } } : {},
        '-created_date',
        20
      );
      setInquiries((prev) => [...prev, ...i]);
      setInqMore(i.length === 20);
    } catch (e) {} finally { setLoadingMore(false); }
  }

  async function createAnnouncement() {
    if (!form.title || !form.body) return;
    try {
      await base44.entities.Announcement.create({ ...form, is_active: true });
      await logAudit(`Created announcement "${form.title}"`, 'Announcement');
      toast.success('Announcement published.');
      setForm({ title: '', body: '', priority: 'normal', show_as_popup: false });
      load();
    } catch (e) { toast.error(e.message); }
  }

  async function toggleActive(a) {
    try {
      await base44.entities.Announcement.update(a.id, { is_active: !a.is_active });
      load();
    } catch (e) { toast.error(e.message); }
  }

  async function sendResponse() {
    try {
      await base44.functions.invoke('respondInquiry', { inquiry_id: respondTo.id, response });
      await logAudit(`Responded to inquiry ${respondTo.id}`, 'AdminInquiry');
      toast.success('Reply sent by email.');
      setRespondTo(null);
      setResponse('');
      load();
    } catch (e) { toast.error(e.message); }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">📣 New announcement</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Priority</Label>
            <select className="border border-border rounded px-3 py-2 text-sm w-full bg-card" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="normal">Normal</option><option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div><Label>Body</Label><Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
        <div className="flex items-center justify-between">
          <Label htmlFor="popup">Show as full-screen popup on launch</Label>
          <Switch id="popup" checked={form.show_as_popup} onCheckedChange={(v) => setForm({ ...form, show_as_popup: v })} />
        </div>
        <Button onClick={createAnnouncement}>Publish</Button>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Announcements</h3>
        <div className="space-y-2">
          {announcements.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
          {announcements.map((a) => (
            <div key={a.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium text-sm flex items-center gap-2">{a.title} {a.priority === 'urgent' && <span className="text-red-600">🔴</span>} {a.show_as_popup && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 rounded">popup</span>}</div>
                <div className="text-xs text-muted-foreground">{a.body}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{a.is_active ? 'active' : 'inactive'}</span>
                <Switch checked={a.is_active} onCheckedChange={() => toggleActive(a)} />
              </div>
            </div>
          ))}
          {annMore && (
            <Button variant="outline" onClick={loadMoreAnn} disabled={loadingMore} className="w-full">
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">📥 Admin inbox</h3>
        <div className="space-y-3">
          {inquiries.length === 0 && <p className="text-sm text-muted-foreground">No inquiries.</p>}
          {inquiries.map((i) => (
            <div key={i.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div className="text-xs text-muted-foreground">{i.created_by || i.user_id}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${i.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{i.status}</span>
              </div>
              <div className="text-sm my-1">{i.user_message}</div>
              {i.admin_response && <div className="text-xs text-muted-foreground bg-muted p-2 rounded">Reply: {i.admin_response}</div>}
              {i.status === 'pending' && (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => { setRespondTo(i); setResponse(''); }}>Respond</Button>
              )}
            </div>
          ))}
          {inqMore && (
            <Button variant="outline" onClick={loadMoreInq} disabled={loadingMore} className="w-full">
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      </Card>

      {respondTo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setRespondTo(null)}>
          <div className="bg-card rounded-lg p-4 max-w-md w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">Respond to inquiry</h3>
            <p className="text-sm text-muted-foreground">{respondTo.user_message}</p>
            <Textarea rows={4} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Type your reply..." />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRespondTo(null)}>Cancel</Button>
              <Button onClick={sendResponse} disabled={!response.trim()}>Send reply</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}