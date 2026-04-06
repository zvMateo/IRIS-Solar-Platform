"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import { installations, generateSolarCurve, generateMonthlyData, InstallationStatus } from "@/data/mockData";
import { useMemo } from "react";

// Custom tooltip para la curva solar — muestra kWh + CO₂ + ARS
function SolarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const kwh = payload[0].value as number;
  return (
    <div style={{
      background: "#111B30", border: "1px solid #1E2D45", borderRadius: 10,
      padding: "10px 14px", minWidth: 160,
    }}>
      <p style={{ color: "#94A3B8", fontSize: 11, marginBottom: 6 }}>{label}</p>
      <p style={{ color: "#F59E0B", fontWeight: 700, fontSize: 13 }}>
        {kwh.toLocaleString("es-AR")} kWh
      </p>
      <p style={{ color: "#10B981", fontSize: 10, marginTop: 4 }}>
        ≈ {Math.round(kwh * 0.42).toLocaleString("es-AR")} kg CO₂ evitado
      </p>
      <p style={{ color: "#FBBF24", fontSize: 10, marginTop: 2 }}>
        ≈ ${Math.round(kwh * 85).toLocaleString("es-AR")} ARS ahorrado
      </p>
    </div>
  );
}

// Custom tooltip para el gráfico mensual
function MonthlyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const kwh = payload[0].value as number;
  return (
    <div style={{
      background: "#111B30", border: "1px solid #1E2D45", borderRadius: 10,
      padding: "10px 14px", minWidth: 160,
    }}>
      <p style={{ color: "#94A3B8", fontSize: 11, marginBottom: 6 }}>{label}</p>
      <p style={{ color: "#0D9488", fontWeight: 700, fontSize: 13 }}>
        {kwh.toLocaleString("es-AR")} kWh
      </p>
      <p style={{ color: "#10B981", fontSize: 10, marginTop: 4 }}>
        ≈ {Math.round(kwh * 0.42 / 1000).toFixed(1)} t CO₂ evitado
      </p>
    </div>
  );
}

interface SolarChartsProps {
  selectedInstallation: string | null;
  filters: { status: InstallationStatus | "all"; minPower: number; clientType: string };
}

export default function SolarCharts({ selectedInstallation, filters }: SolarChartsProps) {
  const filtered = useMemo(() => {
    return installations.filter((inst) => {
      if (filters.status !== "all" && inst.status !== filters.status) return false;
      if (inst.powerKwp < filters.minPower) return false;
      if (filters.clientType !== "all" && inst.clientType !== filters.clientType) return false;
      return true;
    });
  }, [filters]);

  const selected = selectedInstallation ? installations.find((i) => i.id === selectedInstallation) : null;

  // Solar curve (24h)
  const curveData = useMemo(() => {
    if (selected) {
      return generateSolarCurve(selected);
    }
    // Aggregate all filtered
    const hours = Array.from({ length: 14 }, (_, i) => i + 6);
    return hours.map((h) => {
      const time = `${h}:00`;
      const total = filtered.reduce((sum, inst) => {
        const curve = generateSolarCurve(inst);
        const point = curve.find((c) => c.time === time);
        return sum + (point?.generation || 0);
      }, 0);
      return { time, generation: Math.round(total) };
    });
  }, [selected, filtered]);

  // Monthly data
  const monthlyData = useMemo(() => {
    if (selected) {
      return generateMonthlyData(selected);
    }
    const months = ["Nov", "Dic", "Ene", "Feb", "Mar", "Abr"];
    return months.map((month) => {
      const total = filtered.reduce((sum, inst) => {
        const data = generateMonthlyData(inst);
        const point = data.find((d) => d.month === month);
        return sum + (point?.generation || 0);
      }, 0);
      return { month, generation: Math.round(total) };
    });
  }, [selected, filtered]);

  const chartTitle = selected ? `Curva Solar — ${selected.name}` : "Generación Total — Últimas 24hs";
  const monthlyTitle = selected ? `Generación Mensual — ${selected.name}` : "Generación Mensual Total";

  // Pico de generación para ReferenceLine
  const peakPoint = useMemo(() =>
    curveData.reduce((max, d) => d.generation > max.generation ? d : max, curveData[0]),
    [curveData]
  );

  // Total del día para el chip del header
  const totalKwhDay = useMemo(() =>
    curveData.reduce((s, d) => s + d.generation, 0),
    [curveData]
  );

  const totalKwhMonth = useMemo(() =>
    monthlyData.reduce((s, d) => s + d.generation, 0),
    [monthlyData]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Solar Curve */}
      <div className="bg-iris-card border border-iris-border rounded-xl p-4">
        {/* Header con chip de total */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-iris-gold" style={{ boxShadow: "0 0 6px #F59E0B88" }} />
            <div>
              <h3 className="text-sm font-bold text-iris-text leading-none">{chartTitle}</h3>
              <p className="text-[10px] text-iris-text-muted mt-0.5">
                {selected ? `${selected.powerKwp} kWp` : `${filtered.length} instalaciones activas`}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-iris-gold font-bold px-2 py-0.5 rounded-full bg-iris-gold/10 border border-iris-gold/20">
            {Math.round(totalKwhDay).toLocaleString("es-AR")} kWh
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={curveData}>
            <defs>
              <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#F59E0B" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" strokeOpacity={0.5} />
            <XAxis dataKey="time" stroke="#94A3B8" tick={{ fontSize: 10 }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
            <Tooltip content={<SolarTooltip />} />
            {peakPoint && (
              <ReferenceLine
                x={peakPoint.time}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                strokeOpacity={0.7}
                label={{ value: "⚡ Pico", fill: "#F59E0B", fontSize: 10, position: "top" }}
              />
            )}
            <Area
              type="monotone"
              dataKey="generation"
              stroke="#F59E0B"
              strokeWidth={2.5}
              fill="url(#colorGen)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly */}
      <div className="bg-iris-card border border-iris-border rounded-xl p-4">
        {/* Header con chip de total */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-iris-teal" style={{ boxShadow: "0 0 6px #0D948888" }} />
            <div>
              <h3 className="text-sm font-bold text-iris-text leading-none">{monthlyTitle}</h3>
              <p className="text-[10px] text-iris-text-muted mt-0.5">Últimos 6 meses</p>
            </div>
          </div>
          <span className="text-[10px] text-iris-teal font-bold px-2 py-0.5 rounded-full bg-iris-teal/10 border border-iris-teal/20">
            {Math.round(totalKwhMonth / 1000).toLocaleString("es-AR")} MWh
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#0D9488" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0D9488" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" strokeOpacity={0.5} />
            <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 10 }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
            <Tooltip content={<MonthlyTooltip />} />
            <Bar dataKey="generation" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
