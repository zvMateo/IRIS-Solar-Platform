"use client";

import { useEffect, useState } from "react";
import { getKPIs, getAllAlerts, installations, statusColors, InstallationStatus } from "@/data/mockData";
import { SolarPanel, Zap, AlertTriangle, Activity, Leaf, DollarSign, Home } from "lucide-react";

interface KPICardsProps {
  onStatusFilter: (status: InstallationStatus | "all") => void;
  currentFilter: InstallationStatus | "all";
}

function AnimatedCounter({ target, duration = 2000, prefix = "", suffix = "" }: { target: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{prefix}{count.toLocaleString("es-AR")}{suffix}</span>;
}

export default function KPICards({ onStatusFilter, currentFilter }: KPICardsProps) {
  const kpis = getKPIs();
  const totalAlerts = getAllAlerts();

  // Métricas de impacto de negocio (simuladas pero realistas)
  const co2Avoided = Math.round(kpis.totalTodayKwh * 0.42); // kg CO2 por kWh en Argentina
  const moneySaved = Math.round(kpis.totalTodayKwh * 85); // ARS por kWh
  const homesPowered = Math.round(kpis.totalMw * 250); // hogares por MW

  const cards = [
    {
      label: "Instalaciones Activas",
      value: <AnimatedCounter target={kpis.active} />,
      suffix: `/${installations.length}`,
      icon: SolarPanel,
      color: "text-iris-teal",
      bgColor: "bg-iris-teal/10",
      borderColor: "border-iris-teal/20",
    },
    {
      label: "MW Totales Instalados",
      value: <span><AnimatedCounter target={Math.round(kpis.totalMw * 10)} suffix="" />.{kpis.totalMw.toFixed(1).split('.')[1]}</span>,
      suffix: " MW",
      icon: Zap,
      color: "text-iris-gold",
      bgColor: "bg-iris-gold/10",
      borderColor: "border-iris-gold/20",
    },
    {
      label: "kWh Generados Hoy",
      value: <AnimatedCounter target={kpis.totalTodayKwh} />,
      suffix: " kWh",
      icon: Activity,
      color: "text-iris-teal-light",
      bgColor: "bg-iris-teal-light/10",
      borderColor: "border-iris-teal-light/20",
    },
    {
      label: "Alertas Activas",
      value: <AnimatedCounter target={totalAlerts.length} />,
      suffix: "",
      icon: AlertTriangle,
      color: totalAlerts.length > 0 ? "text-red-400" : "text-iris-text-muted",
      bgColor: totalAlerts.length > 0 ? "bg-red-500/10" : "bg-iris-card",
      borderColor: totalAlerts.length > 0 ? "border-red-500/20" : "border-iris-border",
      clickable: true,
    },
  ];

  const impactMetrics = [
    {
      label: "CO₂ Evitado Hoy",
      value: <AnimatedCounter target={co2Avoided} />,
      suffix: " kg",
      icon: Leaf,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Ahorro Estimado Hoy",
      value: <span>$<AnimatedCounter target={moneySaved} /></span>,
      suffix: " ARS",
      icon: DollarSign,
      color: "text-iris-gold",
      bgColor: "bg-iris-gold/10",
    },
    {
      label: "Hogares Abastecidos",
      value: <AnimatedCounter target={homesPowered} />,
      suffix: "",
      icon: Home,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPIs principales */}
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
                  <p className="text-2xl font-bold text-iris-text mt-1">
                    {card.value}
                    {card.suffix && <span className="text-sm font-normal text-iris-text-muted ml-1">{card.suffix}</span>}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Métricas de impacto de negocio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {impactMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-iris-card/50 border border-iris-border/50 rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-[10px] text-iris-text-muted uppercase tracking-wider">{metric.label}</p>
                  <p className="text-lg font-bold text-iris-text">
                    {metric.value}
                    {metric.suffix && <span className="text-xs font-normal text-iris-text-muted ml-1">{metric.suffix}</span>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
