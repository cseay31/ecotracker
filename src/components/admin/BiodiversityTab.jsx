import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, Flame, Snowflake, Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline } from 'react-leaflet';
import { toast } from 'sonner';

export default function BiodiversityTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke('biodiversityStats', {});
        if (!alive) return;
        setData(res.data);
      } catch (e) {
        if (alive) toast.error('Could not load biodiversity stats: ' + e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!data) return <div className="text-muted-foreground p-4">No data available.</div>;

  const { summary, hotspots, coldspots, bbox } = data;

  // Map center = bounding box center
  const center = bbox ? [(bbox.minLat + bbox.maxLat) / 2, (bbox.minLng + bbox.maxLng) / 2] : [39.5, -98.3];
  const maxCount = hotspots.length ? hotspots[0].count : 1;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Biodiversity Intelligence</h2>
        <p className="text-muted-foreground text-sm">Observation density across the network — hotspots show where data is rich, coldspots reveal survey gaps.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Leaf} label="Observations" value={summary.total_observations} color="text-emerald-400" />
        <SummaryCard icon={MapPin} label="Geolocated" value={summary.geolocated} color="text-teal-400" />
        <SummaryCard icon={CheckCircle2} label="Unique species" value={summary.unique_species} color="text-sky-400" />
        <SummaryCard icon={AlertTriangle} label="Invasive" value={summary.invasive_observations} color="text-pink-400" />
      </div>

      {/* Map */}
      {bbox ? (
        <div className="rounded-xl overflow-hidden border border-border" style={{ height: 420 }}>
          <MapContainer center={center} zoom={3} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {/* bounding box outline */}
            <Polyline
              positions={[
                [bbox.minLat, bbox.minLng],
                [bbox.maxLat, bbox.minLng],
                [bbox.maxLat, bbox.maxLng],
                [bbox.minLat, bbox.maxLng],
                [bbox.minLat, bbox.minLng],
              ]}
              pathOptions={{ color: '#64748b', dashArray: '6 6' }}
            />
            {hotspots.map((h, i) => {
              const radius = 6 + Math.round((h.count / maxCount) * 22);
              return (
                <CircleMarker key={'h' + i} center={[h.lat, h.lng]} radius={radius}
                  pathOptions={{ color: '#ef4444', fillColor: '#f97316', fillOpacity: 0.55 }}>
                  <Tooltip>🔥 Hotspot · {h.count} obs · {h.unique_species} species</Tooltip>
                </CircleMarker>
              );
            })}
            {coldspots.map((c, i) => (
              <CircleMarker key={'c' + i} center={[c.lat, c.lng]} radius={10}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.35 }}>
                <Tooltip>❄️ Data gap · 0 observations</Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <Card className="p-6 text-center text-muted-foreground">No geolocated observations yet — hotspots appear once data comes in.</Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hotspots list */}
        <Card className="p-4">
          <div className="flex items-center gap-2 font-semibold mb-3"><Flame className="h-5 w-5 text-orange-500" /> Hotspots</div>
          <div className="space-y-2 max-h-72 overflow-auto">
            {hotspots.length === 0 && <div className="text-muted-foreground text-sm">No dense clusters detected.</div>}
            {hotspots.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                <div>
                  <div className="font-medium">#{i + 1} · {h.lat.toFixed(2)}, {h.lng.toFixed(2)}</div>
                  <div className="text-muted-foreground text-xs">{h.unique_species} species</div>
                </div>
                <div className="text-orange-500 font-bold">{h.count} obs</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Coldspots list */}
        <Card className="p-4">
          <div className="flex items-center gap-2 font-semibold mb-3"><Snowflake className="h-5 w-5 text-sky-400" /> Cold spots (survey gaps)</div>
          <div className="space-y-2 max-h-72 overflow-auto">
            {coldspots.length === 0 && <div className="text-muted-foreground text-sm">No gaps — the whole range is covered!</div>}
            {coldspots.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                <div>
                  <div className="font-medium">{c.lat.toFixed(2)}, {c.lng.toFixed(2)}</div>
                  <div className="text-muted-foreground text-xs">No observations recorded</div>
                </div>
                <div className="text-sky-400 font-bold">0 obs</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="p-3">
      <Icon className={`h-5 w-5 ${color} mb-1`} />
      <div className="text-2xl font-bold">{value ?? 0}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}