"use client";

import { getAllAlerts, installations } from "@/data/mockData";
import { AlertTriangle, AlertCircle, Info, Clock } from "lucide-react";

const severityIcons = {
  alta: AlertTriangle,
  media: AlertCircle,
  baja: Info,
};

const severityColors = {
  alta: "text-red-400 bg-red-500/10 border-red-500/20",
  media: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  baja: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export default function AlertsList() {
  const alerts = getAllAlerts();

  return (
    <div className="bg-iris-card border border-iris-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-iris-text mb-3">Últimas Alertas</h3>
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <p className="text-iris-text-muted text-sm text-center py-8">Sin alertas activas</p>
        ) : (
          alerts.map((alert) => {
            const Icon = severityIcons[alert.severity];
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${severityColors[alert.severity]} transition-all hover:opacity-80`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-iris-text truncate">{alert.installationName}</p>
                    <p className="text-xs text-iris-text-muted mt-0.5">{alert.message}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] text-iris-text-muted">{alert.date}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-black/20">
                    {alert.severity}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
