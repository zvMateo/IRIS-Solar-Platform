"use client";

import { useEffect, useState } from "react";
import { getKPIs, getAllAlerts, installations, InstallationStatus } from "@/data/mockData";
import { SolarPanel, Zap, AlertTriangle, Activity, Leaf, DollarSign, Home } from "lucide-react";

interface KPICardsProps {
  onStatusFilter: (status: InstallationStatus | "all") => void;
  currentFilter: InstallationStatus | "all";
}

function useAnimatedCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let frame: number;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return count;
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  trend?: string;
  onClick?: () => void;
  highlight?: boolean;
}

function StatCard({ label, value, subValue, icon: Icon, iconColor, iconBg, borderColor, trend, onClick, highlight }: StatCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={`
        bg-iris-card border ${borderColor} rounded-xl p-4 transition-all duration-200
        ${onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-iris-gold focus-visible:outline-none" : ""}
        ${highlight ? "ring-1 ring-red-500/30" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-iris-text-muted text-[10px] font-medium uppercase tracking-widest leading-none mb-2">
            {label}
          </p>
          <p className="text-2xl font-black text-iris-text leading-none tabular-nums">
            {value}
          </p>
          {subValue && (
            <p className="text-[10px] text-iris-text-muted mt-1.5">{subValue}</p>
          )}
          {trend && (
            <p className="text-[10px] text-emerald-400 mt-1 font-medium">{trend}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function KPICards({ onStatusFilter }: KPICardsProps) {
  const kpis = getKPIs();
  const totalAlerts = getAllAlerts();

  // Contadores animados — cada uno independiente
  const animKwh = useAnimatedCounter(kpis.totalTodayKwh);
  const animActive = useAnimatedCounter(kpis.active);
  const animMw = useAnimatedCounter(Math.round(kpis.totalMw * 10)); // x10 para el decimal
  const animAlerts = useAnimatedCounter(totalAlerts.length, 1000);

  // Métricas de impacto
  const co2 = useAnimatedCounter(Math.round(kpis.totalTodayKwh * 0.42));
  const savings = useAnimatedCounter(Math.round(kpis.totalTodayKwh * 85));
  const homes = useAnimatedCounter(Math.round(kpis.totalMw * 250));

  return (
    <div className="space-y-3">
      {/* ── KPIs principales ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Instalaciones Activas"
          value={`${animActive} / ${installations.length}`}
          subValue="En operación normal"
          icon={SolarPanel}
          iconColor="text-iris-teal"
          iconBg="bg-iris-teal/10"
          borderColor="border-iris-teal/20"
          trend="↑ +2 este trimestre"
        />
        <StatCard
          label="Capacidad Total"
          value={`${(animMw / 10).toFixed(1)} MW`}
          subValue={`${installations.reduce((s, i) => s + i.panelCount, 0).toLocaleString("es-AR")} paneles instalados`}
          icon={Zap}
          iconColor="text-iris-gold"
          iconBg="bg-iris-gold/10"
          borderColor="border-iris-gold/20"
        />
        <StatCard
          label="Generación de Hoy"
          value={`${animKwh.toLocaleString("es-AR")} kWh`}
          subValue="Actualizado en tiempo real"
          icon={Activity}
          iconColor="text-iris-teal-light"
          iconBg="bg-iris-teal/10"
          borderColor="border-iris-teal/20"
          trend="↑ 12% vs. ayer"
        />
        <StatCard
          label="Alertas Activas"
          value={animAlerts.toString()}
          subValue={animAlerts > 0 ? "Requieren atención" : "Sistema estable"}
          icon={AlertTriangle}
          iconColor={animAlerts > 0 ? "text-red-400" : "text-iris-text-muted"}
          iconBg={animAlerts > 0 ? "bg-red-500/10" : "bg-iris-card"}
          borderColor={animAlerts > 0 ? "border-red-500/30" : "border-iris-border"}
          highlight={animAlerts > 0}
          onClick={() => onStatusFilter("alerta")}
        />
      </div>

      {/* ── Impacto ambiental y económico ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-iris-card/60 border border-emerald-500/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
            <Leaf className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] text-iris-text-muted uppercase tracking-wider">CO₂ Evitado Hoy</p>
            <p className="text-base font-black text-emerald-400 tabular-nums">
              {co2.toLocaleString("es-AR")} <span className="text-xs font-normal text-iris-text-muted">kg</span>
            </p>
          </div>
        </div>

        <div className="bg-iris-card/60 border border-iris-gold/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-iris-gold/10 flex-shrink-0">
            <DollarSign className="w-4 h-4 text-iris-gold" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] text-iris-text-muted uppercase tracking-wider">Ahorro Estimado</p>
            <p className="text-base font-black text-iris-gold tabular-nums">
              ${savings.toLocaleString("es-AR")} <span className="text-xs font-normal text-iris-text-muted">ARS</span>
            </p>
          </div>
        </div>

        <div className="bg-iris-card/60 border border-blue-500/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
            <Home className="w-4 h-4 text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] text-iris-text-muted uppercase tracking-wider">Hogares Abastecidos</p>
            <p className="text-base font-black text-blue-400 tabular-nums">
              {homes.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
