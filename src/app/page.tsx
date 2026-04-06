"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  SolarPanel, Sun, BarChart3, MessageSquare, Wrench,
  Maximize2, Minimize2, RefreshCw, Wifi, ChevronRight,
  Zap, TrendingUp
} from "lucide-react";
import KPICards from "@/components/KPICards";
import SolarCharts from "@/components/SolarCharts";
import AlertsList from "@/components/AlertsList";
import MapFilters from "@/components/MapFilters";
import AIChat from "@/components/AIChat";
import EquipmentTable from "@/components/EquipmentTable";
import InstallationDetail from "@/components/InstallationDetail";
import { InstallationStatus, installations } from "@/data/mockData";
import { useLiveData } from "@/hooks/useLiveData";
import { ThemeToggle } from "@/components/ThemeToggle";

const SolarMap = dynamic(() => import("@/components/SolarMap"), { ssr: false });

type Tab = "map" | "dashboard" | "chat" | "equipment";

// ── Pantalla de bienvenida ──────────────────────────────────────────
function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-iris-darker flex flex-col items-center justify-center relative overflow-hidden">
      {/* Toggle de tema en la splash — top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Fondo animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width: `${200 + i * 120}px`,
              height: `${200 + i * 120}px`,
              border: "1px solid #F59E0B",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              animation: `ping ${2 + i * 0.4}s cubic-bezier(0,0,0.2,1) infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="relative z-10 text-center space-y-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-iris-gold via-amber-500 to-amber-600 shadow-2xl shadow-iris-gold/30">
            <Sun className="w-10 h-10 text-iris-dark" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-black text-iris-text tracking-tight">
              IRIS <span className="text-iris-gold">Solar</span>
            </h1>
            <p className="text-base text-iris-teal font-medium tracking-widest uppercase">Platform</p>
          </div>
        </div>

        <p className="text-iris-text-muted text-sm max-w-sm mx-auto">
          Monitoreo inteligente de instalaciones solares para Córdoba, Argentina
        </p>

        {/* Stats de IRIS Energía */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { value: "+310", label: "Instalaciones" },
            { value: "+9 MW", label: "Instalados" },
            { value: "+270", label: "Clientes" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-iris-card/60 border border-iris-border rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-iris-gold">{value}</p>
              <p className="text-xs text-iris-text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onEnter}
          disabled={loading}
          className="mt-6 flex items-center gap-3 mx-auto bg-gradient-to-r from-iris-gold to-amber-500 text-iris-dark font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-iris-gold/30 transition-all hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-wait"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Cargando plataforma...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Acceder a la plataforma
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-iris-text-muted mt-4">
          Representantes oficiales de Sungrow & Jinko Solar
        </p>
      </div>
    </div>
  );
}

// ── App principal ──────────────────────────────────────────────────
export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [selectedInstallation, setSelectedInstallation] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [filters, setFilters] = useState<{
    status: InstallationStatus | "all";
    minPower: number;
    clientType: string;
  }>({ status: "all", minPower: 0, clientType: "all" });

  const live = useLiveData(5000);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "map", label: "Mapa Solar", icon: <SolarPanel className="w-4 h-4" /> },
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "chat", label: "Chat IA", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "equipment", label: "Equipos", icon: <Wrench className="w-4 h-4" /> },
  ];

  const clientTypeLabels: Record<string, string> = {
    agro: "Agro", industria: "Industria", comercio: "Comercio",
    cooperativa: "Cooperativa", comunidad: "Comunidad Solar", inversor: "Inversor Particular",
  };
  const clientTypeColors: Record<string, string> = {
    agro: "bg-green-500", industria: "bg-blue-500", comercio: "bg-purple-500",
    cooperativa: "bg-amber-500", comunidad: "bg-teal-500", inversor: "bg-pink-500",
  };

  if (showSplash) return <SplashScreen onEnter={() => setShowSplash(false)} />;

  return (
    <div className={`min-h-screen bg-iris-dark ${presentationMode ? "overflow-hidden" : ""}`}>
      {/* Header */}
      <header className="bg-iris-card/90 backdrop-blur border-b border-iris-border sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="p-2 rounded-xl bg-gradient-to-br from-iris-gold to-amber-600 shadow-md shadow-iris-gold/20">
              <Sun className="w-5 h-5 text-iris-dark" />
            </div>
            <div>
              <h1 className="text-sm font-black text-iris-text tracking-tight leading-none">
                IRIS <span className="text-iris-gold">Solar</span> Platform
              </h1>
              <p className="text-[9px] text-iris-text-muted tracking-wider mt-0.5">IRIS ENERGÍA — Córdoba, Argentina</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="hidden sm:flex items-center gap-1 bg-iris-dark rounded-lg p-1 border border-iris-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-iris-gold text-iris-dark shadow-sm"
                    : "text-iris-text-muted hover:text-iris-text"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right side: live indicator + potencia activa + presentacion */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Potencia activa LIVE */}
            <div className="hidden md:flex items-center gap-2 bg-iris-dark border border-iris-border rounded-lg px-3 py-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-iris-teal" />
              <span className="text-[10px] text-iris-text-muted">Activo ahora:</span>
              <span className="text-xs font-bold text-iris-teal">
                {live.activePower.toLocaleString("es-AR")} kW
              </span>
            </div>

            {/* Live dot + timestamp */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <span className="text-[10px] text-iris-text-muted hidden sm:inline">
                {live.updatedAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Modo presentación */}
            <button
              onClick={() => setPresentationMode(!presentationMode)}
              title={presentationMode ? "Salir de presentación" : "Modo presentación"}
              aria-label={presentationMode ? "Salir de modo presentación" : "Activar modo presentación"}
              className="p-2 rounded-lg border border-iris-border text-iris-text-muted hover:text-iris-gold hover:border-iris-gold/30 transition-all cursor-pointer"
            >
              {presentationMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden flex border-t border-iris-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs transition-all ${
                activeTab === tab.id ? "text-iris-gold border-b-2 border-iris-gold" : "text-iris-text-muted"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className={`max-w-[1920px] mx-auto p-4 ${presentationMode ? "h-[calc(100vh-56px)] overflow-hidden" : ""}`}>
        {/* KPI Cards */}
        {!presentationMode && (
          <div className="mb-4">
            <KPICards
              onStatusFilter={(status) => { setFilters((f) => ({ ...f, status })); setActiveTab("map"); }}
              currentFilter={filters.status}
            />
          </div>
        )}

        {/* Live ticker en modo presentación */}
        {presentationMode && (
          <div className="mb-3 grid grid-cols-4 gap-3">
            {[
              { label: "kWh Generados Hoy", value: live.totalTodayKwh.toLocaleString("es-AR"), unit: "kWh", color: "text-iris-gold" },
              { label: "Potencia Activa", value: live.activePower.toLocaleString("es-AR"), unit: "kW", color: "text-iris-teal" },
              { label: "CO₂ Evitado", value: live.co2Avoided.toLocaleString("es-AR"), unit: "kg", color: "text-green-400" },
              { label: "Ahorro del día", value: `$${live.moneySaved.toLocaleString("es-AR")}`, unit: "ARS", color: "text-iris-gold-light" },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="bg-iris-card border border-iris-border rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-[10px] text-iris-text-muted uppercase tracking-wider">{label}</span>
                <span className={`text-lg font-black ${color}`}>
                  {value} <span className="text-xs font-normal text-iris-text-muted">{unit}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Contenido de tabs */}
        {activeTab === "map" && (
          <div className={`grid grid-cols-1 xl:grid-cols-4 gap-4 ${presentationMode ? "h-[calc(100%-60px)]" : ""}`}>
            <div className={`xl:col-span-3 space-y-3 ${presentationMode ? "flex flex-col h-full" : ""}`}>
              {!presentationMode && <MapFilters filters={filters} onFilterChange={setFilters} />}
              <div className={presentationMode ? "flex-1" : "h-[calc(100vh-320px)] min-h-[500px]"}>
                <SolarMap
                  selectedInstallation={selectedInstallation}
                  onSelectInstallation={(id) => { setSelectedInstallation(id); setShowDetail(!!id); }}
                  filters={filters}
                />
              </div>
            </div>
            <div className="xl:col-span-1">
              {showDetail && selectedInstallation ? (
                <InstallationDetail
                  installationId={selectedInstallation}
                  onClose={() => { setShowDetail(false); setSelectedInstallation(null); }}
                />
              ) : (
                <AlertsList />
              )}
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <SolarCharts selectedInstallation={null} filters={filters} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AlertsList />
              <div className="bg-iris-card border border-iris-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-iris-text mb-3">Portfolio por Segmento</h3>
                <div className="space-y-2">
                  {(["agro", "industria", "comercio", "cooperativa", "comunidad", "inversor"] as const).map((type) => {
                    const count = installations.filter((i) => i.clientType === type).length;
                    const totalKwp = installations.filter((i) => i.clientType === type).reduce((s, i) => s + i.powerKwp, 0);
                    const pct = Math.round((count / installations.length) * 100);
                    return (
                      <div key={type}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${clientTypeColors[type]}`} />
                          <span className="text-xs text-iris-text-muted flex-1">{clientTypeLabels[type]}</span>
                          <span className="text-xs text-iris-text font-semibold">{count} inst.</span>
                          <span className="text-xs text-iris-text-muted">{totalKwp} kWp</span>
                        </div>
                        <div className="h-1 bg-iris-dark rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${clientTypeColors[type]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-iris-border">
                  <h4 className="text-xs font-semibold text-iris-text mb-3">Fabricantes</h4>
                  {["Sungrow", "Huawei"].map((brand) => {
                    const count = installations.filter((i) => i.inverterBrand === brand).length;
                    const pct = Math.round((count / installations.length) * 100);
                    return (
                      <div key={brand} className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${brand === "Sungrow" ? "bg-iris-gold" : "bg-iris-teal"}`} />
                          <span className="text-xs text-iris-text-muted flex-1">{brand}</span>
                          <span className="text-xs text-iris-text font-semibold">{pct}%</span>
                        </div>
                        <div className="h-1 bg-iris-dark rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${brand === "Sungrow" ? "bg-iris-gold" : "bg-iris-teal"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-[calc(100vh-200px)] min-h-[500px]">
              <AIChat />
            </div>
            <div className="lg:col-span-1">
              <AlertsList />
            </div>
          </div>
        )}

        {activeTab === "equipment" && <EquipmentTable />}
      </main>

      {/* Footer — solo fuera de presentación */}
      {!presentationMode && (
        <footer className="border-t border-iris-border mt-8 py-3">
          <div className="max-w-[1920px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[10px] text-iris-text-muted">
              © 2026 IRIS Solar Platform — IRIS Energía | +310 instalaciones | +9 MW instalados | Córdoba, Argentina
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-iris-text-muted">Partners oficiales:</span>
              <span className="text-[10px] font-semibold text-iris-gold">Sungrow</span>
              <span className="text-iris-border">|</span>
              <span className="text-[10px] font-semibold text-iris-teal">Jinko Solar</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
