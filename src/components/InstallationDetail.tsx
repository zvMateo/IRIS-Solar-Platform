"use client";

import { installations, generateSolarCurve, generateMonthlyData, statusColors, clientTypeLabels, getEfficiencyScore } from "@/data/mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { X, SolarPanel, Zap, Calendar, AlertTriangle, Wrench, TrendingUp } from "lucide-react";

interface InstallationDetailProps {
  installationId: string;
  onClose: () => void;
}

// Donut SVG de eficiencia
function EfficiencyDonut({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const arc = (score / 100) * circ;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : score === 0 ? "#94A3B8" : "#EF4444";
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#1E2D45" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${arc} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="27" textAnchor="middle" fontSize="9" fill={color} fontWeight="bold">
        {score === 0 ? "—" : `${score}%`}
      </text>
    </svg>
  );
}

export default function InstallationDetail({ installationId, onClose }: InstallationDetailProps) {
  const inst = installations.find((i) => i.id === installationId);
  if (!inst) return null;

  const solarCurve = generateSolarCurve(inst);
  const monthlyData = generateMonthlyData(inst);
  const score = getEfficiencyScore(inst);
  const scoreColor = score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                   : score >= 60 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                   : score === 0 ? "text-iris-text-muted bg-iris-dark border-iris-border"
                   :               "text-red-400 bg-red-500/10 border-red-500/20";

  return (
    <div className="bg-iris-card border border-iris-border rounded-xl overflow-hidden flex flex-col max-h-[600px]">
      {/* Header con gradiente de color del status */}
      <div
        className="p-4 border-b border-iris-border flex items-start justify-between"
        style={{ background: `linear-gradient(135deg, ${statusColors[inst.status]}12 0%, transparent 100%)` }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-iris-text">{inst.name}</h2>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              style={{
                backgroundColor: `${statusColors[inst.status]}20`,
                color: statusColors[inst.status],
                borderColor: `${statusColors[inst.status]}44`,
              }}
            >
              {inst.status}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${scoreColor}`}>
              {score === 0 ? "offline" : `${score}% eficiencia`}
            </span>
          </div>
          <p className="text-xs text-iris-text-muted mt-0.5">{inst.location} · {clientTypeLabels[inst.clientType]}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <EfficiencyDonut score={score} />
          <button onClick={onClose} className="p-1 rounded hover:bg-iris-dark transition-colors">
            <X className="w-4 h-4 text-iris-text-muted" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-iris-dark rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-iris-gold" />
              <span className="text-[10px] text-iris-text-muted uppercase">Potencia</span>
            </div>
            <p className="text-lg font-bold text-iris-text">{inst.powerKwp} <span className="text-xs font-normal text-iris-text-muted">kWp</span></p>
          </div>
          <div className="bg-iris-dark rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <SolarPanel className="w-3.5 h-3.5 text-iris-teal" />
              <span className="text-[10px] text-iris-text-muted uppercase">Paneles</span>
            </div>
            <p className="text-lg font-bold text-iris-text">{inst.panelCount}</p>
            <p className="text-[10px] text-iris-text-muted">{inst.panelsConnected} conectados / {inst.panelsDisconnected} desconectados</p>
          </div>
          <div className="bg-iris-dark rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-iris-gold-light" />
              <span className="text-[10px] text-iris-text-muted uppercase">Generación Hoy</span>
            </div>
            <p className="text-lg font-bold text-iris-gold">{inst.generationTodayKwh} <span className="text-xs font-normal text-iris-text-muted">kWh</span></p>
          </div>
          <div className="bg-iris-dark rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-iris-teal-light" />
              <span className="text-[10px] text-iris-text-muted uppercase">Generación Mes</span>
            </div>
            <p className="text-lg font-bold text-iris-text">{inst.generationMonthKwh.toLocaleString("es-AR")} <span className="text-xs font-normal text-iris-text-muted">kWh</span></p>
          </div>
          <div className="bg-iris-dark rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[10px] text-iris-text-muted uppercase">Inyectada</span>
            </div>
            <p className="text-lg font-bold text-green-400">{inst.energyInjectedKwh.toLocaleString("es-AR")} <span className="text-xs font-normal text-iris-text-muted">kWh</span></p>
          </div>
          <div className="bg-iris-dark rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-iris-text-muted uppercase">Consumida</span>
            </div>
            <p className="text-lg font-bold text-blue-400">{inst.energyConsumedKwh.toLocaleString("es-AR")} <span className="text-xs font-normal text-iris-text-muted">kWh</span></p>
          </div>
        </div>

        {/* Equipment Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-iris-dark rounded-lg p-3">
            <span className="text-[10px] text-iris-text-muted uppercase">Inversor</span>
            <p className="text-sm font-semibold text-iris-text mt-0.5">{inst.inverterBrand} {inst.inverterModel}</p>
            <p className="text-xs text-iris-text-muted">{inst.inverterPowerKw} kW</p>
          </div>
          <div className="bg-iris-dark rounded-lg p-3">
            <span className="text-[10px] text-iris-text-muted uppercase">Paneles</span>
            <p className="text-sm font-semibold text-iris-text mt-0.5">{inst.panelBrand}</p>
          </div>
          <div className="bg-iris-dark rounded-lg p-3">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-iris-text-muted" />
              <span className="text-[10px] text-iris-text-muted uppercase">Último Mantenimiento</span>
            </div>
            <p className="text-sm font-semibold text-iris-text mt-0.5">{inst.lastMaintenance}</p>
          </div>
          <div className="bg-iris-dark rounded-lg p-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-iris-gold" />
              <span className="text-[10px] text-iris-text-muted uppercase">Próximo Mantenimiento</span>
            </div>
            <p className="text-sm font-semibold text-iris-text mt-0.5">{inst.nextMaintenance}</p>
          </div>
        </div>

        {/* Solar Curve */}
        <div>
          <h4 className="text-xs font-semibold text-iris-text mb-2">Curva de Generación - Hoy</h4>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={solarCurve}>
              <defs>
                <linearGradient id={`detail-gen-${inst.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
              <XAxis dataKey="time" stroke="#94A3B8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111B30",
                  border: "1px solid #1E2D45",
                  borderRadius: "8px",
                  color: "#E2E8F0",
                  fontSize: "11px",
                }}
                formatter={(value) => [`${value} kWh`, "Generación"]}
              />
              <Area type="monotone" dataKey="generation" stroke="#F59E0B" strokeWidth={2} fill={`url(#detail-gen-${inst.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly */}
        <div>
          <h4 className="text-xs font-semibold text-iris-text mb-2">Generación Mensual (últimos 6 meses)</h4>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
              <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111B30",
                  border: "1px solid #1E2D45",
                  borderRadius: "8px",
                  color: "#E2E8F0",
                  fontSize: "11px",
                }}
                formatter={(value) => [`${Number(value).toLocaleString("es-AR")} kWh`, "Generación"]}
              />
              <Area type="monotone" dataKey="generation" stroke="#0D9488" strokeWidth={2} fill="rgba(13,148,136,0.15)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        {inst.alerts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-iris-text mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Alertas Activas ({inst.alerts.length})
            </h4>
            <div className="space-y-2">
              {inst.alerts.map((alert) => (
                <div key={alert.id} className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      alert.severity === "alta" ? "bg-red-500/20 text-red-400" :
                      alert.severity === "media" ? "bg-amber-500/20 text-amber-400" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-iris-text">{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
