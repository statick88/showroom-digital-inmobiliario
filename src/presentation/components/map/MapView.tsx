"use client";

import { useCallback, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import { usePropiedades } from "@/presentation/hooks/usePropiedades";
import { PropertyDetailPanel } from "./PropertyDetailPanel";
import { PropertyList } from "./PropertyList";
import { PropertyFilters } from "./PropertyFilters";
import { LeadForm } from "./LeadForm";
import { MetricasPanel } from "./MetricasPanel";
import { MapController } from "./MapController";
import { MasterPlanOverlay } from "./MasterPlanOverlay";
import { env } from "@/config/env";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import type { Propiedad } from "@/domain/entities/propiedad";
import type { FiltrosPropiedades } from "@/domain/repositories/propiedades.repository";

const COLORS: Record<Propiedad["estado"], string> = {
  disponible: "#22c55e",
  separado: "#eab308",
  vendido: "#ef4444",
};

const LABELS: Record<Propiedad["estado"], string> = {
  disponible: "Disponible",
  separado: "Separado",
  vendido: "Vendido",
};

function formatPrice(precio: number, moneda: string) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "PEN",
    maximumFractionDigits: 0,
  }).format(precio);
}

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
      <div className="flex flex-col gap-4">
        <div className="w-full h-[50vh] bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500">
          Cargando mapa...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <PropertyFilters filters={filters} onChange={setFilters} />

      {/* Metrics */}
      <MetricasPanel />

      {/* Map */}
      <div className="relative w-full h-[50vh] rounded-xl overflow-hidden">
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
          {markers.map((p) => {
            const color = COLORS[p.estado];
            const isSelected = p.id === selected?.id;
            return (
              <Marker
                key={p.id}
                position={[p.ubicacion!.y, p.ubicacion!.x]}
                icon={divIcon({
                  className: "",
                  html: `<div style="width:${isSelected ? 20 : 16}px;height:${isSelected ? 20 : 16}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer"></div>`,
                  iconSize: [isSelected ? 20 : 16, isSelected ? 20 : 16],
                  iconAnchor: [isSelected ? 10 : 8, isSelected ? 10 : 8],
                  popupAnchor: [0, -12],
                })}
                eventHandlers={{ click: () => handleMarkerClick(p) }}
              >
                <Popup>
                  <div className="font-sans text-sm leading-snug min-w-[180px]">
                    <p className="font-semibold text-base mb-1">{p.titulo}</p>
                    <p className="text-zinc-600 mb-1">
                      {p.distrito && `${p.distrito}, `}
                      {p.ciudad}
                    </p>
                    <p className="font-bold text-lg mb-1">{formatPrice(p.precio, p.moneda)}</p>
                    <span
                      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: color + "22", color }}
                    >
                      {LABELS[p.estado]}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Toggle master plan */}
        <button
          onClick={() => setMasterPlanVisible((v) => !v)}
          className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/90 dark:bg-zinc-900/90 shadow-md hover:bg-white dark:hover:bg-zinc-900 transition-colors"
        >
          {masterPlanVisible ? (
            <EyeOffIcon className="size-3.5" />
          ) : (
            <EyeIcon className="size-3.5" />
          )}
          {masterPlanVisible ? "Ocultar plano" : "Ver plano"}
        </button>
      </div>

      {/* Property list */}
      <PropertyList
        propiedades={propiedades}
        isLoading={isLoading}
        selectedId={selected?.id}
        onSelect={handleCardClick}
      />

      {/* Detail panel */}
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
