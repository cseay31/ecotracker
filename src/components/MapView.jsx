import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, LocateFixed, X, MapPin, Loader2 } from 'lucide-react';

function pinIcon(emoji, invasive) {
  const color = invasive ? '#dc2626' : '#16a34a';
  return L.divIcon({
    className: 'ecotracker-pin',
    html: `<div style="background:${color};width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(-45deg);font-size:15px">${emoji}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

const userIcon = L.divIcon({
  className: 'ecotracker-user',
  html: `<div style="background:#2563eb;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function BoundsHandler({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => emit(),
    zoomend: () => emit(),
  });
  const emit = () => {
    const b = map.getBounds();
    onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
  };
  useEffect(() => {
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

function FocusHandler({ focus }) {
  const map = useMap();
  useEffect(() => {
    if (!focus || focus.lat == null || focus.long == null) return;
    map.flyTo([focus.lat, focus.long], focus.zoom || 14, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);
  return null;
}

export default function MapView({
  observations = [],
  onBoundsChange,
  focus,
  searchQuery = '',
  onSearchChange,
  height = '100%',
}) {
  const mapRef = useRef(null);
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [addr, setAddr] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const geocode = (e) => {
    e.preventDefault();
    const q = addr.trim();
    if (!q) return;
    setGeoLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data[0]) {
          const ll = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          mapRef.current?.flyTo(ll, 14, { duration: 0.8 });
        }
      })
      .finally(() => setGeoLoading(false));
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(ll);
        mapRef.current?.flyTo(ll, 14, { duration: 0.8 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="relative" style={{ height, width: '100%' }}>
      {/* Search overlay */}
      <div className="absolute left-3 top-3 z-[1000] w-72 max-w-[75%]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search species or common name..."
            className="w-full pl-8 pr-8 py-2 text-sm rounded-md border bg-background/95 backdrop-blur shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <form onSubmit={geocode} className="relative mt-2">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            placeholder="Search address or zipcode..."
            className="w-full pl-8 pr-8 py-2 text-sm rounded-md border bg-background/95 backdrop-blur shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {geoLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </form>
      </div>

      {/* Locate-me overlay */}
      <button
        type="button"
        onClick={locate}
        disabled={locating}
        className="absolute right-3 top-3 z-[1000] bg-background/95 backdrop-blur border rounded-md h-9 w-9 flex items-center justify-center shadow-md hover:bg-accent disabled:opacity-60"
        title="Zoom to my location"
      >
        <LocateFixed className={`h-5 w-5 ${locating ? 'animate-pulse' : ''}`} />
      </button>

      {/* Legend overlay */}
      <div className="absolute left-3 bottom-3 z-[1000] bg-background/95 backdrop-blur border rounded-md shadow-md px-3 py-2 text-xs space-y-1.5">
        <div className="font-semibold text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Legend</div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#16a34a] border border-white shadow-sm" />
          <span>Native / non-invasive</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#dc2626] border border-white shadow-sm" />
          <span>Invasive species</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🌿 Photo observation</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🔊 Audio observation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#2563eb] border-2 border-white" />
          <span>Your location</span>
        </div>
      </div>

      <MapContainer
        ref={mapRef}
        center={[20, 0]}
        zoom={3}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl overflow-hidden z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_2sh6_1_dbddc1154c3584ee2750a645"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          subdomains="abcd"
          maxZoom={20}
        />
        <TileLayer
          url="https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png"
          opacity={0.7}
          attribution="iNaturalist"
        />
        <FocusHandler focus={focus} />
        <BoundsHandler onBoundsChange={onBoundsChange} />
        {userPos && (
          <Marker position={userPos} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {observations
          .filter((o) => o.public_lat != null && o.public_long != null)
          .map((o) => (
            <Marker
              key={o.id}
              position={[o.public_lat, o.public_long]}
              icon={pinIcon(o.observation_type === 'audio' ? '🔊' : '🌿', o.is_invasive)}
            >
              <Popup>
                <div className="text-sm space-y-0.5 min-w-[160px]">
                  <div className="font-semibold">{o.common_name || o.species_name}</div>
                  {o.species_name && o.species_name !== 'Unknown' && (
                    <div className="text-xs italic text-muted-foreground">{o.species_name}</div>
                  )}
                  <div>Confidence: {o.confidence_score ?? 0}%</div>
                  <div className="capitalize">Status: {o.status?.replace(/_/g, ' ')}</div>
                  {o.is_invasive && <div className="text-red-600 font-medium">⚠ Invasive species</div>}
                  {o.observation_type === 'audio' && <div className="text-xs">🔊 Audio observation</div>}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}