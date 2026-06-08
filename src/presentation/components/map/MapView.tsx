"use client";

import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type L from "leaflet";
import { HeaderNav } from "@/presentation/components/map/HeaderNav";
import { PropertyFilters } from "@/presentation/components/map/PropertyFilters";
import { GlassControls } from "@/presentation/components/map/GlassControls";
import { MarkerPopup } from "@/presentation/components/map/MarkerPopup";
import { PropertyDetailPanel } from "@/presentation/components/detail/PropertyDetailPanel";
import { LeadForm } from "@/presentation/components/map/LeadForm";
import {
  getMarkerColor,
  MARKER_SIZE,
  MARKER_BORDER_WIDTH,
  MARKER_BORDER_COLOR,
} from "@/config/markers";
import { usePropiedades } from "@/presentation/hooks/usePropiedades.legacy";
import type { Propiedad } from "@/domain/entities/propiedad";
import type { FiltrosPropiedades } from "@/domain/repositories/propiedades.repository";
import type { FiltersState } from "./PropertyFilters";
import { StatusChip } from "@/components/ui/status-chip";
import { formatPrice } from "@/presentation/lib/formatters";
import { useClickTracker } from "@/presentation/hooks/useClickTracker";
import { useRealtimePropiedades } from "@/presentation/hooks/useRealtimePropiedades";
import { getPublicAssetPath, isValidPoint } from "@/presentation/components/map/map-utils";

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prev = useRef({ lat, lng });

  useEffect(() => {
    if (prev.current.lat !== lat || prev.current.lng !== lng) {
      map.flyTo([lat, lng], 15, { duration: 0.6 });
      prev.current = { lat, lng };
    }
  }, [lat, lng, map]);

  return null;
}

/** Stores the Leaflet map instance so MapView can call zoom/pan methods */
function MapInstanceStore({ onMap }: { onMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
}

interface PropertyListProps {
  propiedades: Propiedad[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (p: Propiedad) => void;
}

function PropertyList({ propiedades, isLoading, selectedId, onSelect }: PropertyListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!propiedades || propiedades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <p className="typo-body-md">No se encontraron propiedades</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {propiedades.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className={`w-full text-left flex gap-3 p-3 rounded-xl transition-all duration-150 hover:border-primary hover:shadow-card hover:shadow-card-hover ${
            selectedId === p.id
              ? "border-2 border-primary bg-primary/5"
              : "border border-border bg-card"
          }`}
        >
          <img
            src={p.imagenes[0] ?? getPublicAssetPath("placeholder.svg")}
            alt={p.titulo}
            className="w-20 h-20 object-cover rounded-lg shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <p className="text-sm font-semibold text-foreground truncate">{p.titulo}</p>
              <StatusChip status={p.estado} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {p.distrito && `${p.distrito}, `}
              {p.ciudad}
            </p>
            <p className="text-sm font-bold text-foreground mt-1">
              {formatPrice(p.precio, p.moneda)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function filtersStateToFiltros(fs: FiltersState): FiltrosPropiedades {
  const f: FiltrosPropiedades = {};
  if (fs.tipo) f.tipo = fs.tipo;
  if (fs.estado) f.estado = fs.estado;
  if (fs.distrito) f.distrito = fs.distrito;
  if (fs.moneda) f.moneda = fs.moneda;
  if (fs.precioMin) f.precioMin = Number(fs.precioMin);
  if (fs.precioMax) f.precioMax = Number(fs.precioMax);
  return f;
}

export function MapView() {
  const [filters, setFilters] = useState<FiltersState>({
    tipo: "",
    estado: "",
    distrito: "",
    precioMin: "",
    precioMax: "",
    moneda: "",
  });

  const queryFilters = useMemo(() => filtersStateToFiltros(filters), [filters]);
  const { data: propiedades, isLoading } = usePropiedades(queryFilters);
  const [selected, setSelected] = useState<Propiedad | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [satellite, setSatellite] = useState(false);
  const leafletMapRef = useRef<L.Map | null>(null);
  const { trackClick } = useClickTracker();
  useRealtimePropiedades();

  const handleMapReady = useCallback((map: L.Map) => {
    leafletMapRef.current = map;
  }, []);

  const handleCardClick = useCallback(
    (p: Propiedad) => {
      setSelected(p);
      if (isValidPoint(p.ubicacion)) {
        setFlyTo({ lat: p.ubicacion.y, lng: p.ubicacion.x });
      }
      setDetailOpen(true);
      trackClick(p.id, "click");
    },
    [trackClick],
  );

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
  }, []);

  const handleContact = useCallback(() => {
    setLeadFormOpen(true);
  }, []);

  const handleCloseLeadForm = useCallback(() => {
    setLeadFormOpen(false);
  }, []);

  const markers = useMemo(() => {
    if (!propiedades) return [];
    return propiedades.filter((p) => isValidPoint(p.ubicacion));
  }, [propiedades]);

  const handleZoomIn = useCallback(() => {
    leafletMapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    leafletMapRef.current?.zoomOut();
  }, []);

  const handleGeolocate = useCallback(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFlyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Geolocation failed silently
        },
      );
    }
  }, []);

  const handleToggleLayer = useCallback(() => {
    setSatellite((prev) => !prev);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <HeaderNav />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar — Desktop: fixed width, Mobile: below map */}
        <aside
          data-testid="property-list-sidebar"
          className="md:w-[380px] md:h-full flex flex-col bg-card border-r border-border overflow-hidden md:order-first order-last relative z-20"
        >
          <PropertyFilters filters={filters} onFilterChange={setFilters} />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <PropertyList
              propiedades={propiedades}
              isLoading={isLoading}
              selectedId={selected?.id ?? null}
              onSelect={handleCardClick}
            />
          </div>
        </aside>

        {/* Map area — Desktop: fills remaining space, Mobile: 50vh top */}
        <section className="flex-1 relative md:order-last order-first md:h-full h-[50vh] z-10">
          <MapContainer
            center={[-12.1354, -76.9967]}
            zoom={14}
            className="w-full h-full"
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={
                satellite
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />
            {flyTo && <MapFlyTo lat={flyTo.lat} lng={flyTo.lng} />}
            <MapInstanceStore onMap={handleMapReady} />

            {markers.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.ubicacion!.y, p.ubicacion!.x]}
                radius={MARKER_SIZE / 2}
                pathOptions={{
                  color: MARKER_BORDER_COLOR,
                  weight: MARKER_BORDER_WIDTH,
                  fillColor: getMarkerColor(p.estado),
                  fillOpacity: 1,
                }}
                  eventHandlers={{
                    click: () => handleCardClick(p),
                  }}
                >
                <Popup>
                  <MarkerPopup propiedad={p} />
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Glass Controls */}
          <GlassControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onGeolocate={handleGeolocate}
            onToggleLayer={handleToggleLayer}
          />
        </section>
      </div>

      {/* Detail Panel */}
      <PropertyDetailPanel
        propiedad={selected}
        isOpen={detailOpen}
        onClose={handleCloseDetail}
        onContact={handleContact}
      />

      {/* Lead Form Modal */}
      {selected && leadFormOpen && <LeadForm propiedad={selected} onClose={handleCloseLeadForm} />}
    </div>
  );
}
