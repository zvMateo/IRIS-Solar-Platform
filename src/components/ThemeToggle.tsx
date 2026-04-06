"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hydration mismatch — solo renderizar en cliente
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg border border-iris-border bg-iris-card" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      className="
        relative p-2 rounded-lg border border-iris-border
        bg-iris-card text-iris-text-muted
        hover:border-iris-gold/40 hover:text-iris-gold
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-gold/40
        transition-all duration-200 cursor-pointer
        flex items-center gap-1.5
      "
    >
      <div className="relative w-4 h-4">
        {/* Sun */}
        <Sun
          className={`
            absolute inset-0 w-4 h-4 transition-all duration-300
            ${isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}
          `}
        />
        {/* Moon */}
        <Moon
          className={`
            absolute inset-0 w-4 h-4 transition-all duration-300
            ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}
          `}
        />
      </div>
      <span className="text-[10px] font-medium hidden sm:inline">
        {isDark ? "Oscuro" : "Claro"}
      </span>
    </button>
  );
}
