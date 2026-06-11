"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Propiedad } from "@/domain/entities/propiedad";
import { Button } from "@/components/ui/button";
import { HeroImage } from "@/presentation/components/map/HeroImage";
import { SpecsGrid } from "@/presentation/components/detail/SpecsGrid";
import { Gallery } from "@/presentation/components/map/Gallery";
import { useClickTracker } from "@/presentation/hooks/useClickTracker";
import { WhatsAppButton } from "@/presentation/components/whatsapp/WhatsAppButton";

interface PropertyDetailPanelProps {
  propiedad: Propiedad | null;
  isOpen: boolean;
  onClose: () => void;
  onContact?: (propiedad: Propiedad) => void;
}

export function PropertyDetailPanel({
  propiedad,
  isOpen,
  onClose,
  onContact,
}: PropertyDetailPanelProps) {
  const { trackClick } = useClickTracker();

  // Track vista_detalle when panel opens.
  // NOTE: we depend on `propiedad.id` (string), not the full `propiedad`
  // object, to avoid re-triggering when the parent re-renders with a new
  // object reference for the same row. That previously caused a feedback
  // loop: trackClick → query invalidation → parent re-render → new
  // propiedad ref → useEffect fires again → flood of requests → browser
  // runs out of resources (ERR_INSUFFICIENT_RESOURCES).
  const propiedadId = propiedad?.id;
  useEffect(() => {
    if (isOpen && propiedadId) {
      trackClick(propiedadId, "vista_detalle");
    }
  }, [isOpen, propiedadId, trackClick]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !propiedad) return null;

  return (
    <AnimatePresence>
      {/* Desktop: Centered modal with fade */}
      <div className="hidden md:block">
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="detail-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
              />
              {/* Modal */}
              <motion.div
                key="detail-modal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-label="Detalle de propiedad"
              >
                <div className="relative w-full max-w-lg rounded-xl bg-card shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="size-4" />
                  </button>

                  {/* Scrollable content */}
                  <div className="overflow-y-auto">
                    <HeroImage propiedad={propiedad} />

                    <div className="p-4 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">{propiedad.titulo}</h2>
                        <p className="text-sm text-muted-foreground">
                          {propiedad.distrito && `${propiedad.distrito}, `}
                          {propiedad.ciudad}
                        </p>
                      </div>

                      <SpecsGrid propiedad={propiedad} />

                      {propiedad.descripcion && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {propiedad.descripcion}
                        </p>
                      )}

                      <Gallery propiedad={propiedad} />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Button className="flex-1" size="lg" onClick={() => onContact?.(propiedad)}>
                        Contactar
                      </Button>
                      <WhatsAppButton
                        propertyName={propiedad.titulo}
                        price={propiedad.precio}
                        vendedorPhone={propiedad.telefono}
                        propertyId={propiedad.id}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile: Slide from right */}
      <div className="md:hidden">
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
              />
              {/* Panel sliding from right */}
              <motion.div
                key="mobile-panel"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 right-0 z-50 w-full bg-card shadow-xl overflow-hidden flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Detalle de propiedad"
                style={{ maxWidth: "100vw" }}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 left-3 z-10 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="size-5" />
                </button>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                  <HeroImage propiedad={propiedad} />

                  <div className="p-4 space-y-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{propiedad.titulo}</h2>
                      <p className="text-sm text-muted-foreground">
                        {propiedad.distrito && `${propiedad.distrito}, `}
                        {propiedad.ciudad}
                      </p>
                    </div>

                    <SpecsGrid propiedad={propiedad} />

                    {propiedad.descripcion && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {propiedad.descripcion}
                      </p>
                    )}

                    <Gallery propiedad={propiedad} />
                  </div>
                </div>

                {/* CTA fixed at bottom */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <Button className="flex-1" size="lg" onClick={() => onContact?.(propiedad)}>
                      Contactar
                    </Button>
                    <WhatsAppButton
                      propertyName={propiedad.titulo}
                      price={propiedad.precio}
                      vendedorPhone={propiedad.telefono}
                      propertyId={propiedad.id}
                      size="lg"
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
