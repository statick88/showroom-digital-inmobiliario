"use client";

import { useCallback, useState, useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { usePropiedades } from "@/presentation/hooks/usePropiedades.legacy";
import { useClickTracker } from "@/presentation/hooks/useClickTracker";
import { PropertyList } from "./PropertyList.legacy";
import { MapController } from "./MapController";
import { MasterPlanOverlay } from "./MasterPlanOverlay";
import { PropertyMarkers } from "./PropertyMarkers.legacy";
import { env } from "@/config/env";
import type { Propiedad } from "@/domain/entities/propiedad";
import type { FiltrosPropiedades } from "@/domain/repositories/propiedades.repository";

export function MapView() {
  const [filters, setFilters] = useState<FiltrosPropiedades>({});
  const { data: propiedades, isLoading } = usePropiedades(filters);
  const [selected, setSelected] = useState<Propiedad | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [masterPlanVisible, setMasterPlanVisible] = useState(false);
  const { trackClick } = useClickTracker();

  const handleMarkerClick = useCallback(
    (p: Propiedad) => {
      setSelected(p);
      trackClick(p.id);
    },
    [trackClick],
  );

  const handleCardClick = useCallback((p: Propiedad) => {
    setSelected(p);
    if (p.ubicacion) {
      setFlyTo({ lat: p.ubicacion.y, lng: p.ubicacion.x });
    }
  }, []);

  const markers = useMemo(() => {
    if (!propiedades) return [];
    return propiedades.filter((p) => p.ubicacion);
  }, [propiedades]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-[320px] h-full bg-muted border-r border-border p-4 space-y-4">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Cargando mapa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[320px] h-full bg-card border-r border-border flex-col overflow-hidden">
        {/* Filters Header */}
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="typo-headline-md text-foreground">Explorar Lima</h2>
            <button
              onClick={() => setFilters({})}
              className="text-primary typo-label-md hover:underline"
            >
              Limpiar
            </button>
          </div>
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
      <section className="flex-1 relative bg-muted">
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
        <div className="absolute top-6 right-6 flex flex-col gap-3 items-end z-10">
          <div className="glass-panel rounded-xl p-1 flex shadow-glass">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg typo-label-md font-semibold shadow-sm">
              Mapa
            </button>
            <button className="px-4 py-2 text-muted-foreground typo-label-md hover:bg-muted transition-colors rounded-lg">
              Satélite
            </button>
          </div>
          <div className="glass-panel rounded-xl p-3 flex items-center gap-3 shadow-glass">
            <span className="typo-label-md font-semibold text-foreground">Ver plano</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={masterPlanVisible}
                onChange={(e) => setMasterPlanVisible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>
      </section>

    </div>
  );
}
