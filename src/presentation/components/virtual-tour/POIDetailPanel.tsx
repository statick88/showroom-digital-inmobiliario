"use client";

import { useEffect, useRef, useCallback } from "react";
import { POI_ICONS, POI_COLORS } from "@/config/poi-icons";
import type { TourPOI } from "@/domain/entities/tour-poi";

export interface POIDetailPanelProps {
  poi: TourPOI | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Detail panel for POIs in the virtual tour context.
 * Desktop (≥768px): slide-over from right.
 * Mobile (<768px): bottom-sheet (lower 60%).
 * Shows POI name, description, type icon, and a close button.
 * Mirrors ParcelDetailPanel pattern (backdrop, swipe-down, Escape key).
 */
export function POIDetailPanel({ poi, isOpen, onClose }: POIDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // Swipe-down to dismiss (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? 0;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = (e.changedTouches[0]?.clientY ?? 0) - touchStartY.current;
      if (deltaY > 80) {
        onClose();
      }
    },
    [onClose],
  );

  // Escape key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !poi) return null;

  const icon = POI_ICONS[poi.poi_type] ?? "📍";
  const colors = POI_COLORS[poi.poi_type] ?? POI_COLORS.other;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={`Detalle POI ${poi.name}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={[
          "fixed z-50 bg-card border border-border shadow-xl overflow-y-auto",
          // Desktop: slide-over from right
          "max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:rounded-t-2xl max-md:h-[60vh]",
          "md:top-0 md:right-0 md:bottom-0 md:w-[420px] md:rounded-l-2xl",
        ].join(" ")}
      >
        {/* Drag handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
              style={{ backgroundColor: colors.bg }}
              aria-hidden="true"
            >
              {icon}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {poi.name}
              </h2>
              <span
                className="inline-block px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {poi.poi_type}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {poi.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {poi.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">
              Sin descripción
            </p>
          )}
        </div>
      </div>
    </>
  );
}
