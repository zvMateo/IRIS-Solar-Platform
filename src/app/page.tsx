"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SolarPanel, Sun, BarChart3, MessageSquare, Wrench } from "lucide-react";
import KPICards from "@/components/KPICards";
import SolarCharts from "@/components/SolarCharts";
import AlertsList from "@/components/AlertsList";
import MapFilters from "@/components/MapFilters";
import AIChat from "@/components/AIChat";
import EquipmentTable from "@/components/EquipmentTable";
import InstallationDetail from "@/components/InstallationDetail";
import { InstallationStatus, installations } from "@/data/mockData";

const SolarMap = dynamic(() => import("@/components/SolarMap"), { ssr: false });

type Tab = "map" | "dashboard" | "chat" | "equipment";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [selectedInstallation, setSelectedInstallation] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState<{
    status: InstallationStatus | "all";
    minPower: number;
    clientType: string;
  }>({
    status: "all",
    minPower: 0,
    clientType: "all",
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "map", label: "Mapa", icon: <SolarPanel className="w-4 h-4" /> },
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "chat", label: "Chat IA", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "equipment", label: "Equipos", icon: <Wrench className="w-4 h-4" /> },
  ];

  const clientTypeLabels: Record<string, string> = {
    agro: "Agro",
    industria: "Industria",
    comercio: "Comercio",
    cooperativa: "Cooperativa",
    comunidad: "Comunidad Solar",
    inversor: "Inversor Particular",
  };

  const clientTypeColors: Record<string, string> = {
    agro: "bg-green-500",
    industria: "bg-blue-500",
    comercio: "bg-purple-500",
    cooperativa: "bg-amber-500",
    comunidad: "bg-teal-500",
    inversor: "bg-pink-500",
  };

  return (
    <div className="min-h-screen bg-iris-dark">
      {/* Header */}
      <header className="bg-iris-card/80 backdrop-blur border-b border-iris-border sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-iris-gold to-amber-600">
              <Sun className="w-5 h-5 text-iris-dark" />
            </div>
            <div>
              <h1 className="text-base font-bold text-iris-text tracking-tight">
                IRIS <span className="text-iris-gold">Solar</span> Platform
              </h1>
              <p className="text-[10px] text-iris-text-muted -mt-0.5">Monitoreo Inteligente de Instalaciones Solares</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-iris-dark rounded-lg p-1 border border-iris-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-iris-gold text-iris-dark"
                    : "text-iris-text-muted hover:text-iris-text"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-iris-text-muted hidden sm:inline">En vivo</span>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden flex border-t border-iris-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs transition-all ${
                activeTab === tab.id
                  ? "text-iris-gold border-b-2 border-iris-gold"
                  : "text-iris-text-muted"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto p-4">
        {/* KPI Cards - always visible */}
        <div className="mb-4">
          <KPICards
            onStatusFilter={(status) => {
              setFilters((f) => ({ ...f, status }));
              setActiveTab("map");
            }}
            currentFilter={filters.status}
          />
        </div>

        {/* Tab Content */}
        {activeTab === "map" && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3 space-y-4">
              <MapFilters filters={filters} onFilterChange={setFilters} />
              <div className="h-[calc(100vh-320px)] min-h-[500px]">
                <SolarMap
                  selectedInstallation={selectedInstallation}
                  onSelectInstallation={(id) => {
                    setSelectedInstallation(id);
                    setShowDetail(!!id);
                  }}
                  filters={filters}
                />
              </div>
            </div>
            <div className="xl:col-span-1 space-y-4">
              {showDetail && selectedInstallation ? (
                <InstallationDetail
                  installationId={selectedInstallation}
                  onClose={() => {
                    setShowDetail(false);
                    setSelectedInstallation(null);
                  }}
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
                <h3 className="text-sm font-semibold text-iris-text mb-3">Distribución por Tipo</h3>
                <div className="space-y-2">
                  {(["agro", "industria", "comercio", "cooperativa", "comunidad", "inversor"] as const).map((type) => {
                    const count = installations.filter((i) => i.clientType === type).length;
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${clientTypeColors[type]}`} />
                        <span className="text-xs text-iris-text-muted flex-1">{clientTypeLabels[type]}</span>
                        <span className="text-xs text-iris-text font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-iris-border">
                  <h4 className="text-xs font-semibold text-iris-text mb-2">Distribución por Inversor</h4>
                  <div className="space-y-2">
                    {["Sungrow", "Huawei"].map((brand) => {
                      const count = installations.filter((i) => i.inverterBrand === brand).length;
                      return (
                        <div key={brand} className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${brand === "Sungrow" ? "bg-iris-gold" : "bg-iris-teal"}`} />
                          <span className="text-xs text-iris-text-muted flex-1">{brand}</span>
                          <span className="text-xs text-iris-text font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="h-[calc(100vh-200px)] min-h-[500px]">
                <AIChat />
              </div>
            </div>
            <div className="lg:col-span-1">
              <AlertsList />
            </div>
          </div>
        )}

        {activeTab === "equipment" && (
          <EquipmentTable />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-iris-border mt-8 py-4">
        <div className="max-w-[1920px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-iris-text-muted">
            © 2026 IRIS Solar Platform — IRIS Energía | +310 instalaciones | +9 MW instalados
          </p>
          <p className="text-[10px] text-iris-text-muted">
            Representantes oficiales Sungrow & Jinko Solar
          </p>
        </div>
      </footer>
    </div>
  );
}
