"use client";

import { InstallationStatus, clientTypeLabels } from "@/data/mockData";
import { Filter, SlidersHorizontal } from "lucide-react";

interface MapFiltersProps {
  filters: {
    status: InstallationStatus | "all";
    minPower: number;
    clientType: string;
  };
  onFilterChange: (filters: { status: InstallationStatus | "all"; minPower: number; clientType: string }) => void;
}

export default function MapFilters({ filters, onFilterChange }: MapFiltersProps) {
  return (
    <div className="bg-iris-card border border-iris-border rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal className="w-4 h-4 text-iris-gold" />
        <span className="text-xs font-semibold text-iris-text">Filtros</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status */}
        <div>
          <label className="text-[10px] text-iris-text-muted uppercase tracking-wider mb-1 block">Estado</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as InstallationStatus | "all" })}
            className="w-full bg-iris-dark border border-iris-border rounded-lg px-2 py-1.5 text-xs text-iris-text focus:outline-none focus:border-iris-gold/50"
          >
            <option value="all">Todos</option>
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="alerta">Alerta</option>
          </select>
        </div>

        {/* Power */}
        <div>
          <label className="text-[10px] text-iris-text-muted uppercase tracking-wider mb-1 block">
            Potencia mín: {filters.minPower} kWp
          </label>
          <input
            type="range"
            min={0}
            max={200}
            step={10}
            value={filters.minPower}
            onChange={(e) => onFilterChange({ ...filters, minPower: Number(e.target.value) })}
            className="w-full accent-iris-gold"
          />
        </div>

        {/* Client Type */}
        <div>
          <label className="text-[10px] text-iris-text-muted uppercase tracking-wider mb-1 block">Tipo</label>
          <select
            value={filters.clientType}
            onChange={(e) => onFilterChange({ ...filters, clientType: e.target.value })}
            className="w-full bg-iris-dark border border-iris-border rounded-lg px-2 py-1.5 text-xs text-iris-text focus:outline-none focus:border-iris-gold/50"
          >
            <option value="all">Todos</option>
            {Object.entries(clientTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
