"use client";

import { useState, useEffect, useCallback } from "react";
import { installations, getKPIs } from "@/data/mockData";

// Simula variación realista de datos cada N segundos
function jitter(base: number, pct = 0.03) {
  return Math.round(base * (1 + (Math.random() - 0.5) * pct));
}

export interface LiveKPIs {
  totalTodayKwh: number;
  activePower: number; // kW produciendo ahora mismo
  co2Avoided: number;
  moneySaved: number;
  updatedAt: Date;
}

export function useLiveData(intervalMs = 5000) {
  const base = getKPIs();

  // Potencia activa ahora (hora actual como proxy de la curva solar)
  function getActivePower() {
    const hour = new Date().getHours();
    const solarFactors: Record<number, number> = {
      6: 0.04, 7: 0.12, 8: 0.28, 9: 0.46, 10: 0.63, 11: 0.80,
      12: 0.92, 13: 1.00, 14: 0.95, 15: 0.82, 16: 0.62, 17: 0.40,
      18: 0.20, 19: 0.06,
    };
    const factor = solarFactors[hour] ?? 0;
    const peakKw = installations
      .filter(i => i.status === "operativo")
      .reduce((sum, i) => sum + i.powerKwp * 0.78, 0);
    return Math.round(peakKw * factor);
  }

  const [liveKPIs, setLiveKPIs] = useState<LiveKPIs>({
    totalTodayKwh: base.totalTodayKwh,
    activePower: getActivePower(),
    co2Avoided: Math.round(base.totalTodayKwh * 0.42),
    moneySaved: Math.round(base.totalTodayKwh * 85),
    updatedAt: new Date(),
  });

  const tick = useCallback(() => {
    setLiveKPIs(prev => {
      const newKwh = prev.totalTodayKwh + Math.round(Math.random() * 4); // +0-4 kWh cada tick
      return {
        totalTodayKwh: newKwh,
        activePower: jitter(getActivePower()),
        co2Avoided: Math.round(newKwh * 0.42),
        moneySaved: Math.round(newKwh * 85),
        updatedAt: new Date(),
      };
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(tick, intervalMs);
    return () => clearInterval(timer);
  }, [tick, intervalMs]);

  return liveKPIs;
}
