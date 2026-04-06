"use client";

import { equipment, installations } from "@/data/mockData";
import { useState } from "react";
import { Search, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

type SortField = "brand" | "model" | "powerKw" | "installationName" | "warrantyEnd";
type SortDir = "asc" | "desc";

export default function EquipmentTable() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("installationName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "panel" | "inversor">("all");

  const filtered = equipment
    .filter((eq) => {
      if (typeFilter !== "all" && eq.type !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          eq.brand.toLowerCase().includes(s) ||
          eq.model.toLowerCase().includes(s) ||
          eq.serial.toLowerCase().includes(s) ||
          eq.installationName.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const warrantyBadge = (status: string) => {
    const styles = {
      garantia: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      fuera_garantia: "bg-red-500/10 text-red-400 border-red-500/20",
      proximo_vencimiento: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    const labels = {
      garantia: "En garantía",
      fuera_garantia: "Fuera de garantía",
      proximo_vencimiento: "Próximo vencimiento",
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-3 h-3 inline" />
      ) : (
        <ChevronDown className="w-3 h-3 inline" />
      )
    ) : (
      <ChevronDown className="w-3 h-3 inline opacity-30" />
    );

  return (
    <div className="bg-iris-card border border-iris-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-iris-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-iris-text">Equipos - Paneles e Inversores</h3>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-iris-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar equipo..."
                className="w-full sm:w-56 bg-iris-dark border border-iris-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-iris-text placeholder-iris-text-muted focus:outline-none focus:border-iris-gold/50"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | "panel" | "inversor")}
              className="bg-iris-dark border border-iris-border rounded-lg px-2 py-1.5 text-xs text-iris-text focus:outline-none focus:border-iris-gold/50"
            >
              <option value="all">Todos</option>
              <option value="inversor">Inversores</option>
              <option value="panel">Paneles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-iris-border">
              <th className="text-left py-2.5 px-3 text-iris-text-muted font-medium">Tipo</th>
              <th
                className="text-left py-2.5 px-3 text-iris-text-muted font-medium cursor-pointer hover:text-iris-text"
                onClick={() => handleSort("brand")}
              >
                Marca <SortIcon field="brand" />
              </th>
              <th
                className="text-left py-2.5 px-3 text-iris-text-muted font-medium cursor-pointer hover:text-iris-text"
                onClick={() => handleSort("model")}
              >
                Modelo <SortIcon field="model" />
              </th>
              <th className="text-left py-2.5 px-3 text-iris-text-muted font-medium">Serial</th>
              <th
                className="text-left py-2.5 px-3 text-iris-text-muted font-medium cursor-pointer hover:text-iris-text"
                onClick={() => handleSort("powerKw")}
              >
                Potencia <SortIcon field="powerKw" />
              </th>
              <th
                className="text-left py-2.5 px-3 text-iris-text-muted font-medium cursor-pointer hover:text-iris-text"
                onClick={() => handleSort("installationName")}
              >
                Instalación <SortIcon field="installationName" />
              </th>
              <th className="text-left py-2.5 px-3 text-iris-text-muted font-medium">Garantía</th>
              <th className="py-2.5 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((eq) => (
              <>
                <tr
                  key={eq.id}
                  className="border-b border-iris-border/50 hover:bg-iris-dark/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === eq.id ? null : eq.id)}
                >
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        eq.type === "inversor" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {eq.type === "inversor" ? "INVERSOR" : "PANEL"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-iris-text">{eq.brand}</td>
                  <td className="py-2.5 px-3 text-iris-text-muted">{eq.model}</td>
                  <td className="py-2.5 px-3 text-iris-text-muted font-mono text-[10px]">{eq.serial}</td>
                  <td className="py-2.5 px-3 text-iris-text">{eq.powerKw} {eq.type === "panel" ? "W" : "kW"}</td>
                  <td className="py-2.5 px-3 text-iris-text">{eq.installationName}</td>
                  <td className="py-2.5 px-3">{warrantyBadge(eq.status)}</td>
                  <td className="py-2.5 px-3">
                    <ExternalLink className="w-3.5 h-3.5 text-iris-text-muted" />
                  </td>
                </tr>
                {expandedId === eq.id && (
                  <tr>
                    <td colSpan={8} className="bg-iris-dark/50 px-3 py-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-iris-text-muted text-[10px] uppercase">Tipo</span>
                          <p className="text-iris-text font-medium">{eq.type === "inversor" ? "Inversor" : "Panel Solar"}</p>
                        </div>
                        <div>
                          <span className="text-iris-text-muted text-[10px] uppercase">Marca / Modelo</span>
                          <p className="text-iris-text font-medium">{eq.brand} {eq.model}</p>
                        </div>
                        <div>
                          <span className="text-iris-text-muted text-[10px] uppercase">Serial</span>
                          <p className="text-iris-text font-mono text-[10px]">{eq.serial}</p>
                        </div>
                        <div>
                          <span className="text-iris-text-muted text-[10px] uppercase">Potencia</span>
                          <p className="text-iris-text font-medium">{eq.powerKw} {eq.type === "panel" ? "W" : "kW"}</p>
                        </div>
                        <div>
                          <span className="text-iris-text-muted text-[10px] uppercase">Instalación</span>
                          <p className="text-iris-text font-medium">{eq.installationName}</p>
                        </div>
                        <div>
                          <span className="text-iris-text-muted text-[10px] uppercase">Fecha Instalación</span>
                          <p className="text-iris-text font-medium">{eq.installDate}</p>
                        </div>
                        <div>
                          <span className="text-iris-text-muted text-[10px] uppercase">Fin de Garantía</span>
                          <p className="text-iris-text font-medium">{eq.warrantyEnd}</p>
                        </div>
                        <div>
                          <span className="text-iris-text-muted text-[10px] uppercase">Estado</span>
                          <div className="mt-0.5">{warrantyBadge(eq.status)}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-iris-dark border border-iris-border flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-iris-text-muted" />
            </div>
            <p className="text-sm font-medium text-iris-text">Sin resultados</p>
            <p className="text-xs text-iris-text-muted mt-1">Probá con otro término de búsqueda o cambiá el filtro de tipo</p>
          </div>
        )}
      </div>
    </div>
  );
}
