"use client";

import { useCallback, useState, useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { usePropiedades } from "@/presentation/hooks/usePropiedades";
import { PropertyList } from "./PropertyList";
import { PropertyFilters } from "./PropertyFilters";
import { LeadForm } from "./LeadForm";
import { MetricasPanel } from "./MetricasPanel";
import { MapController } from "./MapController";
import { MasterPlanOverlay } from "./MasterPlanOverlay";
import { PropertyMarkers } from "./PropertyMarkers";
import { PropertyDetailPanel } from "./PropertyDetailPanel";
import { env } from "@/config/env";
import type { Propiedad } from "@/domain/entities/propiedad";
import type { FiltrosPropiedades } from "@/domain/repositories/propiedades.repository";

export function MapView() {
  const [filters, setFilters] = useState<FiltrosPropiedades>({});
  const { data: propiedades, isLoading } = usePropiedades(filters);
  const [selected, setSelected] = useState<Propiedad | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [leadPropiedad, setLeadPropiedad] = useState<Propiedad | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [masterPlanVisible, setMasterPlanVisible] = useState(false);

  const handleMarkerClick = useCallback((p: Propiedad) => {
    setSelected(p);
    setDetailOpen(true);
  }, []);

  const handleCardClick = useCallback((p: Propiedad) => {
    setSelected(p);
    if (p.ubicacion) {
      setFlyTo({ lat: p.ubicacion.y, lng: p.ubicacion.x });
    }
    // On mobile, open detail panel
    setDetailOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDetailOpen(false);
  }, []);

  const handleContact = useCallback((p: Propiedad) => {
    setDetailOpen(false);
    setLeadPropiedad(p);
  }, []);

  const markers = useMemo(() => {
    if (!propiedades) return [];
    return propiedades.filter((p) => p.ubicacion);
  }, [propiedades]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-[320px] h-full bg-surface-container-low border-r border-outline-variant p-4 space-y-4">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-500">Cargando mapa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[320px] h-full bg-surface-container-low border-r border-outline-variant flex-col overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-outline-variant space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-headline-md text-on-surface">Explorar Lima</h2>
            <button
              onClick={() => setFilters({})}
              className="text-primary font-label-md text-label-md hover:underline"
            >
              Limpiar
            </button>
          </div>
          <PropertyFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Property List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <PropertyList
            propiedades={propiedades}
            isLoading={isLoading}
            selectedId={selected?.id}
            onSelect={handleCardClick}
          />
        </div>
      </aside>

      {/* Map Section */}
      <section className="flex-1 relative bg-surface-container-low">
        <MapContainer
          center={[-12.1354, -76.9967]}
          zoom={14}
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController flyTo={flyTo} />
          {masterPlanVisible && env.masterPlanImageUrl && (
            <MasterPlanOverlay imageUrl={env.masterPlanImageUrl} />
          )}
          <PropertyMarkers propiedades={markers} onSelect={handleMarkerClick} />
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-md right-md flex flex-col gap-sm items-end z-10">
          <div className="glass-panel rounded-xl p-1 flex shadow-lg">
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md shadow-md">
              Mapa
            </button>
            <button className="px-4 py-2 text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors rounded-lg">
              Satélite
            </button>
          </div>
          <div className="glass-panel rounded-xl p-3 flex items-center gap-3 shadow-lg">
            <span className="font-label-md text-label-md text-on-surface font-semibold">Ver plano</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={masterPlanVisible}
                onChange={(e) => setMasterPlanVisible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>

        {/* Mobile Filters Button */}
        <button
          className="lg:hidden absolute top-4 left-4 z-10 glass-panel rounded-full p-2 shadow-lg"
          onClick={() => setFilters({ ...filters, mobileOpen: true })}
        >
          <svg className="size-5 text-primary" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
          </svg>
        </button>
      </section>

      {/* Property Detail Slide-over */}
      <PropertyDetailPanel
        propiedad={selected}
        open={detailOpen}
        onClose={handleClose}
        onContact={handleContact}
      />

      <LeadForm
        propiedad={leadPropiedad}
        open={leadPropiedad !== null}
        onClose={() => setLeadPropiedad(null)}
      />
    </div>
  );
}