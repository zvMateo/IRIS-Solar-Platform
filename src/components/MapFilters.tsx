"use client";

import { InstallationStatus, clientTypeLabels, installations, statusColors } from "@/data/mockData";
import { SlidersHorizontal, X } from "lucide-react";

interface MapFiltersProps {
  filters: {
    status: InstallationStatus | "all";
    minPower: number;
    clientType: string;
  };
  onFilterChange: (filters: { status: InstallationStatus | "all"; minPower: number; clientType: string }) => void;
}

const DEFAULT_FILTERS = { status: "all" as const, minPower: 0, clientType: "all" };

export default function MapFilters({ filters, onFilterChange }: MapFiltersProps) {
  const activeCount = [
    filters.status !== "all",
    filters.minPower > 0,
    filters.clientType !== "all",
  ].filter(Boolean).length;

  const hasActive = activeCount > 0;

  // Conteo dinámico según filtros activos
  const filteredCount = installations.filter((inst) => {
    if (filters.status !== "all" && inst.status !== filters.status) return false;
    if (inst.powerKwp < filters.minPower) return false;
    if (filters.clientType !== "all" && inst.clientType !== filters.clientType) return false;
    return true;
  }).length;

  return (
    <div className={`bg-iris-card border rounded-xl p-3 transition-colors ${hasActive ? "border-iris-gold/30" : "border-iris-border"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className={`w-4 h-4 ${hasActive ? "text-iris-gold" : "text-iris-text-muted"}`} />
          <span className="text-xs font-semibold text-iris-text">Filtros</span>
          {hasActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-iris-gold/20 text-iris-gold font-medium border border-iris-gold/30">
              {activeCount} activo{activeCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Resultado dinámico */}
          <span className="text-[10px] text-iris-text-muted">
            <span className="text-iris-text font-semibold">{filteredCount}</span> de {installations.length} instalaciones
          </span>
          {/* Reset */}
          {hasActive && (
            <button
              onClick={() => onFilterChange(DEFAULT_FILTERS)}
              className="flex items-center gap-1 text-[10px] text-iris-text-muted hover:text-iris-gold transition-colors cursor-pointer"
              aria-label="Limpiar filtros"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Estado — chips visuales en lugar de select */}
        <div>
          <label className="text-[10px] text-iris-text-muted uppercase tracking-wider mb-1.5 block">
            Estado
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "operativo", "mantenimiento", "alerta"] as const).map((s) => {
              const isActive = filters.status === s;
              const color = s !== "all" ? statusColors[s] : undefined;
              return (
                <button
                  key={s}
                  onClick={() => onFilterChange({ ...filters, status: s })}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                    isActive
                      ? "bg-iris-gold/20 border-iris-gold/50 text-iris-gold"
                      : "bg-iris-dark border-iris-border text-iris-text-muted hover:border-iris-border/80 hover:text-iris-text"
                  }`}
                >
                  {color && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  {s === "all" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Potencia — slider con valores visuales */}
        <div>
          <label
            htmlFor="power-slider"
            className="text-[10px] text-iris-text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between"
          >
            <span>Potencia mínima</span>
            <span className={`font-semibold ${filters.minPower > 0 ? "text-iris-gold" : "text-iris-text-muted"}`}>
              {filters.minPower === 0 ? "Sin límite" : `≥ ${filters.minPower} kWp`}
            </span>
          </label>
          <input
            id="power-slider"
            type="range"
            min={0}
            max={200}
            step={10}
            value={filters.minPower}
            onChange={(e) => onFilterChange({ ...filters, minPower: Number(e.target.value) })}
            className="w-full accent-iris-gold cursor-pointer"
            aria-label={`Potencia mínima: ${filters.minPower} kWp`}
          />
          <div className="flex justify-between text-[9px] text-iris-text-muted mt-0.5">
            <span>0</span><span>100</span><span>200 kWp</span>
          </div>
        </div>

        {/* Tipo de cliente */}
        <div>
          <label htmlFor="client-type" className="text-[10px] text-iris-text-muted uppercase tracking-wider mb-1.5 block">
            Tipo de cliente
          </label>
          <select
            id="client-type"
            value={filters.clientType}
            onChange={(e) => onFilterChange({ ...filters, clientType: e.target.value })}
            className={`w-full bg-iris-dark border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-iris-gold/30 transition-all cursor-pointer ${
              filters.clientType !== "all"
                ? "border-iris-gold/40 text-iris-gold"
                : "border-iris-border text-iris-text"
            }`}
          >
            <option value="all">Todos los segmentos</option>
            {Object.entries(clientTypeLabels).map(([key, label]) => {
              const count = installations.filter((i) => i.clientType === key).length;
              return (
                <option key={key} value={key}>
                  {label} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}
