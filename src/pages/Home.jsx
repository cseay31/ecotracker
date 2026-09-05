import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppShell from '@/components/AppShell';
import MapView from '@/components/MapView';
import { useDebounce } from '@/hooks/useDebounce';
import TopBanner from '@/components/TopBanner';
import AnnouncementPopup from '@/components/AnnouncementPopup';
import ContactAdminDialog from '@/components/ContactAdminDialog';
import MaintenanceOverlay from '@/components/MaintenanceOverlay';
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (location.state?.denied) setDenied(true);
  }, [location]);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedBbox = useDebounce(bbox, 300);

  useEffect(() => {
    (async () => {
      try {
        const settingsList = await base44.entities.SystemSetting.list(1);
        setSettings(settingsList[0] || null);
      } catch (e) {}
      try {
        const u = await base44.auth.me();
        setIsAdmin(u?.role === 'admin');
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
    if (!debouncedBbox) return;
    (async () => {
      try {
        const res = await base44.entities.Observation.filter(
          {
            public_lat: { $gte: debouncedBbox.south, $lte: debouncedBbox.north },
            public_long: { $gte: debouncedBbox.west, $lte: debouncedBbox.east },
          },
          '-timestamp',
          100
        );
        setObservations(res);
      } catch (e) {
        setObservations([]);
      }
    })();
  }, [debouncedBbox]);

  const visibleObservations = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return observations;
    return observations.filter(
      (o) =>
        (o.common_name || '').toLowerCase().includes(q) ||
        (o.species_name || '').toLowerCase().includes(q)
    );
  }, [observations, debouncedSearch]);

  const visibleRecent = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return recent;
    return recent.filter(
      (o) =>
        (o.common_name || '').toLowerCase().includes(q) ||
        (o.species_name || '').toLowerCase().includes(q)
    );
  }, [recent, debouncedSearch]);

  return (
    <AppShell>
      <MaintenanceOverlay settings={settings} />
      <TopBanner text={settings?.top_alert_banner} />
      {denied && (
        <div className="bg-pink-600/90 text-white px-4 py-2 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Access denied — admin privileges required.
        </div>
      )}
      <div className="flex-1 p-4 space-y-7">
        <div className="bio-map-wrap h-[60vh] min-h-[360px]">
          <MapView
            observations={visibleObservations}
            onBoundsChange={setBbox}
            focus={focus}
            searchQuery={search}
            onSearchChange={setSearch}
            isAdmin={isAdmin}
          />
        </div>
        <div>
          <h2 className="bio-section-title">Recent observations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {recent.length === 0 && (
              <p className="text-sm text-teal-200/70 col-span-full">No observations yet. Be the first to scan!</p>
            )}
            {visibleRecent.map((o) => {
              const canZoom = o.public_lat != null && o.public_long != null;
              const conf = Math.max(0, Math.min(100, Number(o.confidence_score) || 0));
              const zoom = () => canZoom && setFocus({ lat: o.public_lat, long: o.public_long, zoom: 14, nonce: Date.now() });
              return (
                <div
                  key={o.id}
                  tabIndex={canZoom ? 0 : undefined}
                  role={canZoom ? 'button' : undefined}
                  onClick={zoom}
                  onKeyDown={canZoom ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zoom(); } } : undefined}
                  className="bio-card"
                >
                  <div className="bio-type">
                    {o.observation_type === 'audio' ? '🔊 Audio' : '🌿 Photo'}
                    {canZoom && <span className="float-right">📍 Zoom</span>}
                  </div>
                  <div className="bio-name">{o.common_name || o.species_name || 'Unknown'}</div>
                  <div className="bio-confidence">Confidence: {o.confidence_score ?? 0}%</div>
                  <div className="bio-meter"><i style={{ width: `${conf}%` }} /></div>
                  {o.is_invasive && <div className="bio-warn">⚠ Invasive</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <button
        className="bio-contact fixed right-4 bottom-20 z-40 rounded-full h-14 w-14 p-0 grid place-items-center"
        onClick={() => setContactOpen(true)}
        aria-label="Contact admin"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
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