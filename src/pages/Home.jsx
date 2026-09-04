import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/AppShell';
import MapView from '@/components/MapView';
import TopBanner from '@/components/TopBanner';
import AnnouncementPopup from '@/components/AnnouncementPopup';
import ContactAdminDialog from '@/components/ContactAdminDialog';
import MaintenanceOverlay from '@/components/MaintenanceOverlay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, AlertCircle } from 'lucide-react';

export default function Home() {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [popup, setPopup] = useState(null);
  const [observations, setObservations] = useState([]);
  const [recent, setRecent] = useState([]);
  const [bbox, setBbox] = useState(null);
  const [focus, setFocus] = useState(null);
  const [search, setSearch] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (location.state?.denied) setDenied(true);
  }, [location]);

  const matchesSearch = (o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.common_name || '').toLowerCase().includes(q) ||
      (o.species_name || '').toLowerCase().includes(q)
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const settingsList = await base44.entities.SystemSetting.list(1);
        setSettings(settingsList[0] || null);
      } catch (e) {}
      try {
        const ann = await base44.entities.Announcement.filter({ is_active: true, show_as_popup: true });
        const seenId = localStorage.getItem('ecotracker.announcement.seen');
        if (ann.length > 0 && ann[0].id !== seenId) setPopup(ann[0]);
      } catch (e) {}
      try {
        const rec = await base44.entities.Observation.list('-timestamp', 10);
        setRecent(rec);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    if (!bbox) return;
    (async () => {
      try {
        const res = await base44.entities.Observation.filter(
          {
            public_lat: { $gte: bbox.south, $lte: bbox.north },
            public_long: { $gte: bbox.west, $lte: bbox.east },
          },
          '-timestamp',
          200
        );
        setObservations(res);
      } catch (e) {
        setObservations([]);
      }
    })();
  }, [bbox]);

  return (
    <AppShell>
      <MaintenanceOverlay settings={settings} />
      <TopBanner text={settings?.top_alert_banner} />
      {denied && (
        <div className="bg-red-50 text-red-700 px-4 py-2 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Access denied — admin privileges required.
        </div>
      )}
      <div className="flex-1 p-4 space-y-4">
        <div className="h-[55vh] min-h-[320px]">
          <MapView
            observations={observations.filter(matchesSearch)}
            onBoundsChange={setBbox}
            focus={focus}
            searchQuery={search}
            onSearchChange={setSearch}
          />
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-2">Recent observations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recent.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No observations yet. Be the first to scan!</p>}
            {recent.filter(matchesSearch).map((o) => {
              const canZoom = o.public_lat != null && o.public_long != null;
              return (
                <Card
                  key={o.id}
                  onClick={() => canZoom && setFocus({ lat: o.public_lat, long: o.public_long, zoom: 14, nonce: Date.now() })}
                  className={`p-3 space-y-1 ${canZoom ? 'cursor-pointer hover:ring-2 hover:ring-primary/40 transition' : ''}`}
                >
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {o.observation_type === 'audio' ? '🔊 Audio' : '🌿 Photo'}
                    {canZoom && <span className="ml-auto">📍 Zoom</span>}
                  </div>
                  <div className="font-medium text-sm leading-tight">{o.common_name || o.species_name || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">Confidence: {o.confidence_score ?? 0}%</div>
                  {o.is_invasive && <div className="text-xs text-red-600 font-medium">⚠ Invasive</div>}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      <Button
        className="fixed right-4 bottom-20 z-40 rounded-full shadow-lg h-14 w-14 p-0"
        onClick={() => setContactOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      <AnnouncementPopup
        announcement={popup}
        onClose={() => {
          if (popup?.id) localStorage.setItem('ecotracker.announcement.seen', popup.id);
          setPopup(null);
        }}
      />
      <ContactAdminDialog open={contactOpen} onOpenChange={setContactOpen} />
    </AppShell>
  );
}