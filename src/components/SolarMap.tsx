"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { installations, InstallationStatus, statusColors, clientTypeLabels } from "@/data/mockData";
import { useMemo, useState } from "react";


// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createCustomIcon(status: InstallationStatus) {
  const color = statusColors[status];
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="${color}" stroke="#0B1426" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="#0B1426"/>
      <circle cx="16" cy="16" r="3" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: "custom-marker",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44],
  });
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface SolarMapProps {
  selectedInstallation: string | null;
  onSelectInstallation: (id: string | null) => void;
  filters: {
    status: InstallationStatus | "all";
    minPower: number;
    clientType: string;
  };
}

export default function SolarMap({ selectedInstallation, onSelectInstallation, filters }: SolarMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return installations.filter((inst) => {
      if (filters.status !== "all" && inst.status !== filters.status) return false;
      if (inst.powerKwp < filters.minPower) return false;
      if (filters.clientType !== "all" && inst.clientType !== filters.clientType) return false;
      return true;
    });
  }, [filters]);

  const center: [number, number] = [-31.42, -64.15];

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-iris-border">
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapController center={center} zoom={8} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {filtered.map((inst) => (
          <Marker
            key={inst.id}
            position={[inst.lat, inst.lng]}
            icon={createCustomIcon(inst.status)}
            eventHandlers={{
              click: () => onSelectInstallation(inst.id === selectedInstallation ? null : inst.id),
              mouseover: () => setHoveredId(inst.id),
              mouseout: () => setHoveredId(null),
            }}
          >
            <Popup maxWidth={320} closeButton={true}>
              <div className="p-1 min-w-[280px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-iris-text text-sm">{inst.name}</h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${statusColors[inst.status]}20`,
                      color: statusColors[inst.status],
                    }}
                  >
                    {inst.status}
                  </span>
                </div>
                <p className="text-iris-text-muted text-xs mb-2">{inst.location}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-iris-text-muted">Potencia</span>
                    <p className="font-semibold text-iris-text">{inst.powerKwp} kWp</p>
                  </div>
                  <div>
                    <span className="text-iris-text-muted">Paneles</span>
                    <p className="font-semibold text-iris-text">{inst.panelCount}</p>
                  </div>
                  <div>
                    <span className="text-iris-text-muted">Generación hoy</span>
                    <p className="font-semibold text-iris-gold">{inst.generationTodayKwh} kWh</p>
                  </div>
                  <div>
                    <span className="text-iris-text-muted">Inversor</span>
                    <p className="font-semibold text-iris-text">{inst.inverterBrand}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-iris-border">
                  <span className="text-iris-text-muted text-xs">Tipo: {clientTypeLabels[inst.clientType]}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-iris-card/90 backdrop-blur border border-iris-border rounded-lg p-3 text-xs">
        <p className="font-semibold text-iris-text mb-1">Estado</p>
        {(["operativo", "mantenimiento", "alerta"] as InstallationStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-2 py-0.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[status] }} />
            <span className="text-iris-text-muted capitalize">{status}</span>
            <span className="text-iris-text-muted ml-auto">
              {installations.filter((i) => i.status === status).length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
