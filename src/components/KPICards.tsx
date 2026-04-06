"use client";

import { getKPIs, getAllAlerts, installations, statusColors, clientTypeLabels, InstallationStatus } from "@/data/mockData";
import { SolarPanel, Zap, AlertTriangle, Activity, TrendingUp, Calendar } from "lucide-react";

interface KPICardsProps {
  onStatusFilter: (status: InstallationStatus | "all") => void;
  currentFilter: InstallationStatus | "all";
}

export default function KPICards({ onStatusFilter, currentFilter }: KPICardsProps) {
  const kpis = getKPIs();
  const totalAlerts = getAllAlerts();

  const cards = [
    {
      label: "Instalaciones Activas",
      value: `${kpis.active}/${installations.length}`,
      icon: SolarPanel,
      color: "text-iris-teal",
      bgColor: "bg-iris-teal/10",
      borderColor: "border-iris-teal/20",
    },
    {
      label: "MW Totales Instalados",
      value: `${kpis.totalMw.toFixed(1)} MW`,
      icon: Zap,
      color: "text-iris-gold",
      bgColor: "bg-iris-gold/10",
      borderColor: "border-iris-gold/20",
    },
    {
      label: "kWh Generados Hoy",
      value: kpis.totalTodayKwh.toLocaleString("es-AR"),
      icon: Activity,
      color: "text-iris-teal-light",
      bgColor: "bg-iris-teal-light/10",
      borderColor: "border-iris-teal-light/20",
    },
    {
      label: "Alertas Activas",
      value: totalAlerts.length.toString(),
      icon: AlertTriangle,
      color: totalAlerts.length > 0 ? "text-red-400" : "text-iris-text-muted",
      bgColor: totalAlerts.length > 0 ? "bg-red-500/10" : "bg-iris-card",
      borderColor: totalAlerts.length > 0 ? "border-red-500/20" : "border-iris-border",
      clickable: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-iris-card border ${card.borderColor} rounded-xl p-4 transition-all duration-200 ${
              card.clickable ? "cursor-pointer hover:border-red-500/40" : ""
            }`}
            onClick={() => card.clickable && onStatusFilter("alerta")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-iris-text-muted text-xs font-medium uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-iris-text mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
