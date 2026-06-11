import { useState, useEffect, Suspense, lazy } from "react";
import { Icon } from "@/components/ui/icon";
import { Tour360 } from "@/presentation/components/map/Tour360";
import { VirtualTourSkeleton } from "@/presentation/components/virtual-tour/VirtualTourSkeleton";

// Lazy load VirtualTourViewer to avoid loading R3F unless needed
const VirtualTourViewer = lazy(() =>
  import("@/presentation/components/virtual-tour/VirtualTourViewer").then((m) => ({
    default: m.VirtualTourViewer,
  }))
);

interface HeroProyectoProps {
  nombre?: string;
  descripcion?: string;
  imagenUrl?: string;
  imagenes360?: string[];
  /** Virtual tour ID for the new R3F viewer. When provided, uses VirtualTourViewer instead of Tour360. */
  tourId?: string;
}

export function HeroProyecto({ nombre, descripcion, imagenUrl, imagenes360, tourId }: HeroProyectoProps) {
  const [showTour, setShowTour] = useState(false);

  // Close tour on Escape key
  useEffect(() => {
    if (!showTour) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowTour(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showTour]);

  // Determine if we can show the tour button
  const hasTour = (tourId && tourId.length > 0) || (imagenes360 && imagenes360.length > 0);

  return (
    <>
      <section className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden">
        {imagenUrl ? (
          <img src={imagenUrl} alt={nombre ?? "Proyecto"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
            <Icon name="landscape" size={64} className="text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          {nombre && <h1 className="typo-headline-lg text-white mb-2 drop-shadow-lg">{nombre}</h1>}
          {descripcion && (
            <p className="typo-body-lg text-white/90 max-w-xl drop-shadow">{descripcion}</p>
          )}
          {hasTour && (
            <button
              type="button"
              onClick={() => setShowTour(true)}
              className="mt-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-foreground px-6 py-3 rounded-xl typo-label-md font-bold hover:bg-white hover:shadow-lg transition-all group cursor-pointer"
            >
              <span className="flex items-center justify-center size-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon name="360" size={20} className="text-primary" />
              </span>
              Ver tour 360°
            </button>
          )}
        </div>
      </section>

      {showTour && (
        <div
          className="fixed inset-0 z-50 bg-black/70 p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa del tour 360°"
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) setShowTour(false);
          }}
        >
          <div className="max-w-5xl mx-auto rounded-2xl bg-card p-4 sm:p-6">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowTour(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Cerrar tour"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Tour content: VirtualTourViewer (preferred) or Tour360 (fallback) */}
            {tourId ? (
              <Suspense fallback={<VirtualTourSkeleton className="aspect-video" />}>
                <VirtualTourViewer
                  tourId={tourId}
                  className="aspect-video"
                  onError={(err) => {
                    console.error("VirtualTourViewer error:", err);
                  }}
                />
              </Suspense>
            ) : imagenes360 && imagenes360.length > 0 ? (
              <Tour360
                imagenes={imagenes360}
                titulo={nombre ? `Tour 360° — ${nombre}` : "Tour 360°"}
                onClose={() => setShowTour(false)}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
