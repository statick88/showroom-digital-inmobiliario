import { useState, useCallback } from "react";
import { Plus, Minus, Crosshair, Layers } from "lucide-react";

interface GlassControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onGeolocate?: () => void;
  onToggleLayer?: () => void;
}

export function GlassControls({
  onZoomIn,
  onZoomOut,
  onGeolocate,
  onToggleLayer,
}: GlassControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Zoom Group */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col shadow-glass">
        <button
          onClick={onZoomIn}
          data-testid="zoom-in"
          className="glass-button px-3 py-2 flex items-center justify-center hover:bg-muted transition-colors rounded-none border-0 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          onClick={onZoomOut}
          data-testid="zoom-out"
          className="glass-button px-3 py-2 flex items-center justify-center hover:bg-muted transition-colors rounded-none border-0 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </button>
      </div>

      {/* Geolocation */}
      <button
        onClick={onGeolocate}
        className="glass-panel rounded-xl p-2.5 shadow-glass hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        aria-label="Centrar en mi ubicación"
      >
        <Crosshair className="size-4" />
      </button>

      {/* Layer Toggle */}
      <button
        onClick={onToggleLayer}
        className="glass-panel rounded-xl p-2.5 shadow-glass hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        aria-label="Cambiar tipo de mapa"
      >
        <Layers className="size-4" />
      </button>
    </div>
  );
}
