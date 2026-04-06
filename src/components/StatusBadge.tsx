"use client";

import { statusColors } from "@/data/mockData";

interface StatusBadgeProps {
  status: string;
  size?: "xs" | "sm";
}

/**
 * Badge centralizado para estados de instalación.
 * Usa statusColors de mockData para garantizar consistencia visual en toda la app.
 */
export function StatusBadge({ status, size = "xs" }: StatusBadgeProps) {
  const color = (statusColors as Record<string, string>)[status] ?? "#94A3B8";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${
        size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{
        color,
        borderColor: `${color}44`,
        backgroundColor: `${color}18`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status}
    </span>
  );
}
