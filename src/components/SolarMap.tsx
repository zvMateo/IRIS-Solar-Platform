"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { installations, InstallationStatus, statusColors, clientTypeLabels } from "@/data/mockData";
import { useMemo, useState } from "react";

delete (L.Icon.Default.prototype as any)._getIconUrl;

function createCustomIcon(status: InstallationStatus, isSelected: boolean, powerKwp: number) {
  const color = statusColors[status];
  const size = powerKwp >= 150 ? 44 : powerKwp >= 80 ? 38 : 32;
  const pulse = status === "alerta" ? `
    <div style="
      position:absolute;
      top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:${size + 16}px;height:${size + 16}px;
      border-radius:50%;
      background:${color}33;
      animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
    "></div>` : "";

  const selectedRing = isSelected ? `
    <div style="
      position:absolute;
      top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:${size + 10}px;height:${size + 10}px;
      border-radius:50%;
      border:2px solid #F59E0B;
      box-shadow:0 0 12px #F59E0B88;
    "></div>` : "";

  // Ícono solar SVG diferente por tipo de estado
  const iconSvg = status === "operativo"
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.7.7M3 12H2M22 12h-1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0z" stroke="#0B1426" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    : status === "mantenimiento"
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="#0B1426" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" stroke="#0B1426" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
      ${pulse}
      ${selectedRing}
      <div style="
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:${color};
        border:2px solid #0B1426;
        box-shadow:0 2px 8px ${color}66;
        display:flex;align-items:center;justify-content:center;
        position:relative;z-index:1;
        transition:transform 0.2s;
        ${isSelected ? 'transform:scale(1.2);' : ''}
      ">
        ${iconSvg}
      </div>
    </div>
    <style>
      @keyframes ping {
        75%,100%{transform:translate(-50%,-50%) scale(2);opacity:0}
      }
    </style>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 8],
  });
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  // Solo setear vista en el primer render
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
  const filtered = useMemo(() => {
    return installations.filter((inst) => {
      if (filters.status !== "all" && inst.status !== filters.status) return false;
      if (inst.powerKwp < filters.minPower) return false;
      if (filters.clientType !== "all" && inst.clientType !== filters.clientType) return false;
      return true;
    });
  }, [filters]);

  const center: [number, number] = [-31.5, -63.8];

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-iris-border">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        {/* Mapa satelital oscuro premium */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {filtered.map((inst) => (
          <Marker
            key={inst.id}
            position={[inst.lat, inst.lng]}
            icon={createCustomIcon(inst.status, inst.id === selectedInstallation, inst.powerKwp)}
            eventHandlers={{
              click: () => onSelectInstallation(inst.id === selectedInstallation ? null : inst.id),
            }}
          >
            <Popup maxWidth={300} closeButton={false} className="iris-popup">
              <div
                style={{ background: "#111B30", border: "1px solid #1E2D45", borderRadius: 12, padding: "12px 14px", minWidth: 260, color: "#E2E8F0", fontFamily: "inherit" }}
                onClick={() => onSelectInstallation(inst.id)}
                className="cursor-pointer"
              >
                {/* Status header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{inst.name}</p>
                  <span style={{
                    padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600,
                    backgroundColor: `${statusColors[inst.status]}22`, color: statusColors[inst.status],
                    border: `1px solid ${statusColors[inst.status]}44`,
                  }}>{inst.status}</span>
                </div>
                <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 10 }}>📍 {inst.location}</p>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {[
                    { label: "Potencia", value: `${inst.powerKwp} kWp` },
                    { label: "Paneles", value: `${inst.panelCount}` },
                    { label: "Generación hoy", value: `${inst.generationTodayKwh} kWh`, highlight: true },
                    { label: "Inversor", value: inst.inverterBrand },
                  ].map(({ label, value, highlight }) => (
                    <div key={label}>
                      <p style={{ fontSize: 10, color: "#94A3B8", margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: highlight ? "#F59E0B" : "#E2E8F0", margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Click CTA */}
                <div style={{ borderTop: "1px solid #1E2D45", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#94A3B8" }}>{clientTypeLabels[inst.clientType]}</span>
                  <span style={{ fontSize: 10, color: "#F59E0B", cursor: "pointer" }}>Ver detalle →</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-iris-darker/90 backdrop-blur border border-iris-border rounded-xl p-3 text-xs">
        <p className="font-semibold text-iris-text mb-2 text-[11px] uppercase tracking-wider">Estado de red</p>
        {(["operativo", "mantenimiento", "alerta"] as InstallationStatus[]).map((status) => {
          const count = installations.filter((i) => i.status === status).length;
          return (
            <div key={status} className="flex items-center gap-2 py-0.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[status], boxShadow: `0 0 6px ${statusColors[status]}88` }} />
              <span className="text-iris-text-muted capitalize flex-1">{status}</span>
              <span className="text-iris-text font-semibold ml-2">{count}</span>
            </div>
          );
        })}
        <div className="border-t border-iris-border mt-2 pt-2">
          <p className="text-iris-text-muted text-[10px]">⊙ Tamaño = potencia instalada</p>
        </div>
      </div>

      {/* Stats flotantes top-right */}
      <div className="absolute top-4 left-4 z-[1000] bg-iris-darker/90 backdrop-blur border border-iris-border rounded-xl px-3 py-2 text-xs">
        <span className="text-iris-text-muted">Mostrando </span>
        <span className="text-iris-gold font-bold">{filtered.length}</span>
        <span className="text-iris-text-muted"> de {installations.length} instalaciones</span>
      </div>
    </div>
  );
}
