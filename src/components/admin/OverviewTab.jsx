import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Leaf, BadgeCheck, MessageSquareWarning, Flag, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDebounce } from '@/hooks/useDebounce';

export default function OverviewTab() {
  const [users, setUsers] = useState([]);
  const [obs, setObs] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [flags, setFlags] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('');
  const [logPage, setLogPage] = useState(1);
  const debouncedLogFilter = useDebounce(logFilter, 300);

  useEffect(() => {
    (async () => {
      try { setUsers(await base44.entities.User.list(200)); } catch (e) {}
      try { setObs(await base44.entities.Observation.list('-created_date', 200)); } catch (e) {}
      try { setInquiries(await base44.entities.AdminInquiry.filter({ status: 'pending' }, '-created_date', 20)); } catch (e) {}
      try { setFlags(await base44.entities.ModerationFlag.filter({ status: 'pending' }, '-created_date', 20)); } catch (e) {}
      try { setLogs(await base44.entities.AuditLog.list('-created_date', 50)); } catch (e) {}
    })();
  }, []);

  const verified = useMemo(() => obs.filter((o) => o.status === 'verified').length, [obs]);
  const activeMembers = useMemo(() => users.filter((u) => u.status !== 'suspended').length, [users]);

  const stats = [
    { label: 'Total Members', value: users.length, icon: Users },
    { label: 'Active Members', value: activeMembers, icon: Activity },
    { label: 'Observations', value: obs.length, icon: Leaf },
    { label: 'Verified', value: verified, icon: BadgeCheck },
  ];

  const chartData = useMemo(() => {
    const byDay = {};
    obs.forEach((o) => {
      const d = (o.timestamp || o.created_date || '').slice(0, 10);
      if (!d) return;
      byDay[d] = (byDay[d] || 0) + 1;
    });
    return Object.entries(byDay).sort().slice(-14).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [obs]);

  const liveFeed = useMemo(
    () => [...users].filter((u) => u.last_active).sort((a, b) => new Date(b.last_active) - new Date(a.last_active)).slice(0, 8),
    [users]
  );
  const filteredLogs = useMemo(
    () => logs.filter((l) => !debouncedLogFilter || (l.action_taken + l.target_entity + (l.created_by || '')).toLowerCase().includes(debouncedLogFilter.toLowerCase())),
    [logs, debouncedLogFilter]
  );
  const visibleLogs = filteredLogs.slice(0, logPage * 20);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
              <s.icon className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-600"><MessageSquareWarning className="h-5 w-5" /> Requires Attention</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Pending user inquiries</span><span className="font-bold">{inquiries.length}</span></li>
            <li className="flex justify-between"><span>Pending moderation flags</span><span className="font-bold">{flags.length}</span></li>
            <li className="flex justify-between"><span>Suspended members</span><span className="font-bold">{users.filter((u) => u.status === 'suspended').length}</span></li>
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-5 w-5" /> Live Activity Feed</h3>
          <ul className="space-y-1 text-sm">
            {liveFeed.length === 0 && <li className="text-muted-foreground">No recent activity.</li>}
            {liveFeed.map((u) => (
              <li key={u.id} className="flex justify-between">
                <span className="truncate">{u.full_name || u.email}</span>
                <span className="text-muted-foreground text-xs">{new Date(u.last_active).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Observation volume (last 14 days)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Flag className="h-5 w-5" /> Audit Logs</h3>
        <input
          className="mb-3 w-full px-3 py-2 rounded border border-border text-sm"
          placeholder="Filter by action, entity, or admin email..."
          value={logFilter}
          onChange={(e) => setLogFilter(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b">
              <tr><th className="py-2 pr-3">Time</th><th className="py-2 pr-3">Admin</th><th className="py-2 pr-3">Action</th><th className="py-2 pr-3">Target</th></tr>
            </thead>
            <tbody>
              {visibleLogs.length === 0 && <tr><td colSpan={4} className="py-3 text-muted-foreground">No logs.</td></tr>}
              {visibleLogs.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="py-2 pr-3 text-xs">{l.created_date ? new Date(l.created_date).toLocaleString() : '-'}</td>
                  <td className="py-2 pr-3 text-xs">{l.created_by || l.admin_id}</td>
                  <td className="py-2 pr-3">{l.action_taken}</td>
                  <td className="py-2 pr-3 text-xs">{l.target_entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleLogs.length < filteredLogs.length && (
            <div className="pt-3">
              <Button variant="outline" className="w-full" onClick={() => setLogPage((p) => p + 1)}>Load more</Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}