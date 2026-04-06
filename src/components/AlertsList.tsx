"use client";

import { getAllAlerts } from "@/data/mockData";
import { AlertTriangle, AlertCircle, Info, Clock, CheckCircle } from "lucide-react";

const severityIcons = {
  alta: AlertTriangle,
  media: AlertCircle,
  baja: Info,
};

function timeSince(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
}

export default function AlertsList() {
  const alerts = getAllAlerts();

  const altaCount = alerts.filter((a) => a.severity === "alta").length;
  const mediaCount = alerts.filter((a) => a.severity === "media").length;

  return (
    <div className="bg-iris-card border border-iris-border rounded-xl p-4">
      {/* Header con conteo de severidad */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-iris-text flex-1">Alertas Activas</h3>
        {altaCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 font-bold">
            {altaCount} ALTA
          </span>
        )}
        {mediaCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
            {mediaCount} media
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          /* Empty state verde — sistema estable */
          <div className="py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-emerald-400">Sistema estable</p>
            <p className="text-xs text-iris-text-muted mt-1">Sin alertas activas</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = severityIcons[alert.severity];
            const borderLeft = alert.severity === "alta"
              ? "border-l-red-500 border-red-500/15 bg-red-500/5"
              : alert.severity === "media"
              ? "border-l-amber-500 border-amber-500/15 bg-amber-500/5"
              : "border-l-blue-500 border-blue-500/10 bg-blue-500/3";

            const iconColor = alert.severity === "alta"
              ? "text-red-400"
              : alert.severity === "media"
              ? "text-amber-400"
              : "text-blue-400";

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 border-t border-r border-b ${borderLeft} transition-all hover:opacity-90`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-iris-text truncate">{alert.installationName}</p>
                    <p className="text-xs text-iris-text-muted mt-0.5">{alert.message}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Clock className="w-3 h-3 text-iris-text-muted" />
                      <span className="text-[10px] text-iris-text-muted">{timeSince(alert.date)}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                    alert.severity === "alta"  ? "bg-red-500/20 text-red-400" :
                    alert.severity === "media" ? "bg-amber-500/20 text-amber-400" :
                                                  "bg-blue-500/20 text-blue-400"
                  }`}>
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
