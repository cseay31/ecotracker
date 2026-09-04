import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export default function MapView({ observations = [], onBoundsChange, focus, height = '100%' }) {
  return (
    <MapContainer center={[20, 0]} zoom={3} scrollWheelZoom style={{ height, width: '100%' }} className="rounded-xl overflow-hidden z-0">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
      />
      <TileLayer
        url="https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png"
        opacity={0.7}
        attribution="iNaturalist"
      />
      <FocusHandler focus={focus} />
      <BoundsHandler onBoundsChange={onBoundsChange} />
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
  );
}