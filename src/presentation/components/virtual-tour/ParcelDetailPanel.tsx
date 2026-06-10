"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Lote } from "@/domain/entities/lote";
import { LoteDetailContent } from "@/presentation/components/lotes/LoteDetailContent";
import { useWhatsAppTour } from "@/presentation/hooks/useWhatsAppTour";

export interface ParcelDetailPanelProps {
  lote: Lote | null;
  tourId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Detail panel for parcels in the virtual tour context.
 * Desktop (≥768px): slide-over from right.
 * Mobile (<768px): bottom-sheet (lower 60%).
 * Renders LoteDetailContent + WhatsApp CTA with tour deep link.
 * Backdrop click or swipe-down dismisses the panel.
 */
export function ParcelDetailPanel({
  lote,
  tourId,
  isOpen,
  onClose,
}: ParcelDetailPanelProps) {
  const { openWhatsApp } = useWhatsAppTour(
    lote ?? ({} as Lote),
    tourId,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // Swipe-down to dismiss (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
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

  if (!isOpen || !lote) return null;

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
        aria-label={`Detalle lote ${lote.codigo}`}
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

        <LoteDetailContent lote={lote} onClose={onClose} />

        {/* WhatsApp CTA */}
        <div className="sticky bottom-0 p-4 bg-card border-t border-border">
          <button
            onClick={openWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20BA5C] text-white py-3 rounded-xl font-bold typo-label-md transition-colors flex items-center justify-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}
