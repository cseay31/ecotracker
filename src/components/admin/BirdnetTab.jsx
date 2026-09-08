import React, { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Activity, Loader2, CheckCircle2, XCircle, Clock, Server } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

export default function BirdnetTab() {
  const [endpoint, setEndpoint] = useState('');
  const [savedEndpoint, setSavedEndpoint] = useState('');
  const [checking, setChecking] = useState(false);
  const [last, setLast] = useState(null);
  const [history, setHistory] = useState([]);
  const [auto, setAuto] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const settings = await base44.entities.SystemSetting.list(1);
        const ep = (settings[0] && settings[0].bioacoustics_endpoint) || '';
        setSavedEndpoint(ep);
        setEndpoint((cur) => cur || ep);
      } catch (e) {}
    })();
  }, []);

  const runCheck = useCallback(async (ep) => {
    const target = (ep || '').trim();
    if (!target) { toast.error('Enter a BirdNET endpoint URL'); return; }
    setChecking(true);
    try {
      const res = await base44.functions.invoke('birdnetHealth', { endpoint: target });
      const d = res.data || {};
      setLast({ ...d, endpoint: target });
      setHistory((h) => [...h.slice(-29), { latency_ms: d.latency_ms, ok: d.ok, status: d.status, checked_at: d.checked_at, error: d.error }]);
      if (!d.ok) toast.error(d.error || 'BirdNET unreachable');
    } catch (e) {
      toast.error('Check failed: ' + e.message);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (auto && endpoint.trim()) {
      runCheck(endpoint);
      timerRef.current = setInterval(() => runCheck(endpoint), 30000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [auto, endpoint, runCheck]);

  const upCount = history.filter((h) => h.ok).length;
  const uptimePct = history.length ? Math.round((upCount / history.length) * 100) : 0;
  const lat = history.filter((h) => h.ok).map((h) => h.latency_ms);
  const avgLat = lat.length ? Math.round(lat.reduce((a, b) => a + b, 0) / lat.length) : 0;
  const minLat = lat.length ? Math.min(...lat) : 0;
  const maxLat = lat.length ? Math.max(...lat) : 0;

  return (
    <div className="space-y-4 max-w-4xl">
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 font-semibold"><Server className="h-5 w-5" /> BirdNET Deployment Monitor</div>
        <div className="text-xs text-muted-foreground">Health-check your self-hosted BirdNET-Analyzer server. EcoTracker pings it server-side, so browser CORS isn't an issue.</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="https://birdnet-api.onrender.com" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
          <Button onClick={() => runCheck(endpoint)} disabled={checking || !endpoint.trim()}>
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            {checking ? 'Checking...' : 'Run check'}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Switch id="birdnet-auto" checked={auto} onCheckedChange={setAuto} />
          <Label htmlFor="birdnet-auto">Auto-refresh every 30s</Label>
          {savedEndpoint && endpoint.trim() === savedEndpoint && (
            <span className="text-xs text-muted-foreground ml-auto">Using endpoint saved in Settings</span>
          )}
        </div>
      </Card>

      {last && (
        <Card className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {last.ok ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : <XCircle className="h-8 w-8 text-red-500" />}
            <div>
              <div className="font-semibold text-lg">{last.ok ? 'Online' : 'Unreachable'}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[260px]">{last.endpoint}</div>
            </div>
            <div className="ml-auto flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {last.latency_ms} ms</div>
              {last.status != null && <div className="text-muted-foreground">HTTP {last.status}</div>}
            </div>
          </div>
          {last.error && <div className="mt-2 text-xs text-red-500">{last.error}</div>}
          <div className="mt-1 text-xs text-muted-foreground">Checked {last.checked_at ? new Date(last.checked_at).toLocaleTimeString() : ''}</div>
        </Card>
      )}

      {history.length > 0 ? (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div><div className="text-xs text-muted-foreground">Uptime</div><div className="text-lg font-bold">{uptimePct}%</div></div>
            <div><div className="text-xs text-muted-foreground">Checks</div><div className="text-lg font-bold">{history.length}</div></div>
            <div><div className="text-xs text-muted-foreground">Avg latency</div><div className="text-lg font-bold">{avgLat} ms</div></div>
            <div><div className="text-xs text-muted-foreground">Min / Max</div><div className="text-lg font-bold">{minLat} / {maxLat} ms</div></div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.map((h, i) => ({ i, latency: h.ok ? h.latency_ms : null, ok: h.ok }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="i" tick={false} />
                <YAxis width={42} unit="ms" />
                <Tooltip content={({ active, payload }) => active && payload && payload[0] ? <div className="bg-card border rounded p-2 text-xs">{payload[0].payload.ok ? `${payload[0].value} ms` : 'unreachable'}</div> : null} />
                <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No checks yet. Run a check to start tracking latency and uptime.
        </Card>
      )}
    </div>
  );
}