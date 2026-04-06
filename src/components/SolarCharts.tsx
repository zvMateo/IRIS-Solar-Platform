"use client";

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
  BarChart,
  Bar,
} from "recharts";
import { installations, generateSolarCurve, generateMonthlyData, InstallationStatus } from "@/data/mockData";
import { useMemo } from "react";

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

  const chartTitle = selected ? `Curva Solar - ${selected.name}` : "Generación Total - Últimas 24hs";
  const monthlyTitle = selected ? `Generación Mensual - ${selected.name}` : "Generación Mensual Total";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Solar Curve */}
      <div className="bg-iris-card border border-iris-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-iris-text mb-1">{chartTitle}</h3>
        <p className="text-xs text-iris-text-muted mb-4">
          {selected ? `${selected.powerKwp} kWp` : `${filtered.length} instalaciones activas`}
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={curveData}>
            <defs>
              <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
            <XAxis dataKey="time" stroke="#94A3B8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111B30",
                border: "1px solid #1E2D45",
                borderRadius: "8px",
                color: "#E2E8F0",
                fontSize: "12px",
              }}
              formatter={(value) => [`${Number(value).toLocaleString("es-AR")} kWh`, "Generación"]}
            />
            <Area
              type="monotone"
              dataKey="generation"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#colorGen)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly */}
      <div className="bg-iris-card border border-iris-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-iris-text mb-1">{monthlyTitle}</h3>
        <p className="text-xs text-iris-text-muted mb-4">Últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
            <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111B30",
                border: "1px solid #1E2D45",
                borderRadius: "8px",
                color: "#E2E8F0",
                fontSize: "12px",
              }}
              formatter={(value) => [`${Number(value).toLocaleString("es-AR")} kWh`, "Generación"]}
            />
            <Bar dataKey="generation" fill="#0D9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
