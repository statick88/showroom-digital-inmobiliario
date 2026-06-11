import { useState, Suspense, lazy } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { VirtualTourSkeleton } from "@/presentation/components/virtual-tour/VirtualTourSkeleton";

// Lazy load VirtualTourViewer to avoid loading R3F unless needed
const VirtualTourViewer = lazy(() =>
  import("@/presentation/components/virtual-tour/VirtualTourViewer").then((m) => ({
    default: m.VirtualTourViewer,
  }))
);

interface TourPreviewProps {
  tourId?: string;
  thumbnailUrl?: string;
  projectName?: string;
}

export function TourPreview({ tourId, thumbnailUrl, projectName }: TourPreviewProps) {
  const [showFullTour, setShowFullTour] = useState(false);

  if (!tourId) return null;

  return (
    <section className="py-16">
      <div className="text-center mb-10">
        <h2 className="typo-headline-lg text-foreground mb-2">Tour Virtual 360°</h2>
        <p className="typo-body-md text-muted-foreground max-w-2xl mx-auto">
          Explora {projectName ?? "nuestro proyecto"} como si estuvieras allí
        </p>
      </div>

      {/* Preview card — always visible */}
      <div className="relative group rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Tour 360° — ${projectName ?? "Proyecto"}`}
            className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-primary/15 via-accent/20 to-secondary/10 flex items-center justify-center">
            <Icon name="view_in_ar" size={72} className="text-primary/30" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* CTA button on the preview */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
          <div>
            <p className="text-white/80 typo-label-md mb-1">Tour interactivo</p>
            <p className="text-white typo-body-lg font-semibold drop-shadow">
              Recorre cada espacio en 360°
            </p>
          </div>
          <Button
            variant="default"
            size="lg"
            onClick={() => setShowFullTour(true)}
            className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 shrink-0 cursor-pointer"
          >
            <Icon name="play_arrow" size={20} />
            Iniciar tour
          </Button>
        </div>
      </div>

      {/* Full-screen tour viewer */}
      {showFullTour && (
        <div
          className="fixed inset-0 z-50 bg-black/80 p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Tour 360° completo"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFullTour(false);
          }}
        >
          <div className="max-w-6xl mx-auto rounded-2xl bg-card overflow-hidden">
            {/* Header with close */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="typo-label-md text-foreground">
                Tour 360° — {projectName ?? "Proyecto"}
              </h3>
              <button
                onClick={() => setShowFullTour(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Cerrar tour"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Tour canvas */}
            <Suspense fallback={<VirtualTourSkeleton className="aspect-video min-h-[400px]" />}>
              <VirtualTourViewer
                tourId={tourId}
                className="aspect-video min-h-[400px]"
                onError={(err) => {
                  console.error("VirtualTourViewer error:", err);
                }}
              />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
}
