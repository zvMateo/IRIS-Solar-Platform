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
  iconHex: string;
  borderColor: string;
  trend?: string;
  onClick?: () => void;
  highlight?: boolean;
}

function StatCard({ label, value, subValue, icon: Icon, iconColor, iconHex, borderColor, trend, onClick, highlight }: StatCardProps) {
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
      style={highlight ? { boxShadow: "inset 0 1px 0 rgba(239,68,68,0.08), 0 4px 16px rgba(0,0,0,0.18)" } : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 16px rgba(0,0,0,0.12)" }}
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
        <div
          className="p-2.5 rounded-xl flex-shrink-0"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${iconHex}25, ${iconHex}08)`,
            border: `1px solid ${iconHex}22`,
          }}
        >
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

  // Proyecciones anuales para las eco-cards
  const co2Annual = Math.round(kpis.totalTodayKwh * 0.42 * 365);
  const trees = Math.round(co2Annual / 21);
  const savingsAnnual = Math.round(kpis.totalTodayKwh * 85 * 365);

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
          iconHex="#0D9488"
          borderColor="border-iris-teal/20"
          trend="↑ +2 este trimestre"
        />
        <StatCard
          label="Capacidad Total"
          value={`${(animMw / 10).toFixed(1)} MW`}
          subValue={`${installations.reduce((s, i) => s + i.panelCount, 0).toLocaleString("es-AR")} paneles instalados`}
          icon={Zap}
          iconColor="text-iris-gold"
          iconHex="#F59E0B"
          borderColor="border-iris-gold/20"
        />
        <StatCard
          label="Generación de Hoy"
          value={`${animKwh.toLocaleString("es-AR")} kWh`}
          subValue="Actualizado en tiempo real"
          icon={Activity}
          iconColor="text-iris-teal-light"
          iconHex="#14B8A6"
          borderColor="border-iris-teal/20"
          trend="↑ 12% vs. ayer"
        />
        <StatCard
          label="Alertas Activas"
          value={animAlerts.toString()}
          subValue={animAlerts > 0 ? "Requieren atención" : "Sistema estable"}
          icon={AlertTriangle}
          iconColor={animAlerts > 0 ? "text-red-400" : "text-iris-text-muted"}
          iconHex={animAlerts > 0 ? "#EF4444" : "#94A3B8"}
          borderColor={animAlerts > 0 ? "border-red-500/30" : "border-iris-border"}
          highlight={animAlerts > 0}
          onClick={() => onStatusFilter("alerta")}
        />
      </div>

      {/* ── Impacto ambiental y económico ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-iris-card/60 border border-emerald-500/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg flex-shrink-0"
            style={{ background: "radial-gradient(circle at 30% 30%, #10B98125, #10B98108)", border: "1px solid #10B98120" }}>
            <Leaf className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-iris-text-muted uppercase tracking-wider">CO₂ Evitado Hoy</p>
            <p className="text-base font-black text-emerald-400 tabular-nums">
              {co2.toLocaleString("es-AR")} <span className="text-xs font-normal text-iris-text-muted">kg</span>
            </p>
            <p className="text-[10px] text-emerald-400/70 mt-0.5 leading-tight">
              ≈ {co2Annual.toLocaleString("es-AR")} kg/año · {trees.toLocaleString("es-AR")} árboles equiv.
            </p>
          </div>
        </div>

        <div className="bg-iris-card/60 border border-iris-gold/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg flex-shrink-0"
            style={{ background: "radial-gradient(circle at 30% 30%, #F59E0B25, #F59E0B08)", border: "1px solid #F59E0B20" }}>
            <DollarSign className="w-4 h-4 text-iris-gold" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-iris-text-muted uppercase tracking-wider">Ahorro Estimado</p>
            <p className="text-base font-black text-iris-gold tabular-nums">
              ${savings.toLocaleString("es-AR")} <span className="text-xs font-normal text-iris-text-muted">ARS</span>
            </p>
            <p className="text-[10px] text-iris-gold/70 mt-0.5 leading-tight">
              ≈ ${Math.round(savingsAnnual / 1000000).toLocaleString("es-AR")}M ARS/año proyectado
            </p>
          </div>
        </div>

        <div className="bg-iris-card/60 border border-blue-500/10 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="p-2 rounded-lg flex-shrink-0"
            style={{ background: "radial-gradient(circle at 30% 30%, #60A5FA25, #60A5FA08)", border: "1px solid #60A5FA20" }}>
            <Home className="w-4 h-4 text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] text-iris-text-muted uppercase tracking-wider">Hogares Abastecidos</p>
            <p className="text-base font-black text-blue-400 tabular-nums">
              {homes.toLocaleString("es-AR")}
            </p>
            <p className="text-[10px] text-blue-400/70 mt-0.5">
              hogares/día con energía solar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
