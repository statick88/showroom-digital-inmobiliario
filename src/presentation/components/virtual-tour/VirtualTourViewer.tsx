import { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { useVirtualTour } from "@/presentation/hooks/use-virtual-tour";
import { useParcelsForTour } from "@/presentation/hooks/useParcelsForTour";
import { useTourPreload } from "@/presentation/hooks/useTourPreload";
import { VirtualTourSkeleton } from "./VirtualTourSkeleton";
import { VirtualTourErrorBoundary } from "./VirtualTourErrorBoundary";
import { VirtualTourCompass } from "./VirtualTourCompass";
import { ParcelDetailPanel } from "./ParcelDetailPanel";
import type { VirtualTourScene } from "@/domain/entities/virtual-tour";
import type { Lote } from "@/domain/entities/lote";
import { Download, Check, Loader2, AlertCircle } from "lucide-react";

// Lazy load the heavy R3F canvas component
const VirtualTourCanvas = lazy(() =>
  import("./VirtualTourCanvas").then((module) => ({
    default: module.VirtualTourCanvas,
  }))
);

interface VirtualTourViewerProps {
  tourId: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function VirtualTourViewer({
  tourId,
  className = "",
  onLoad,
  onError,
}: VirtualTourViewerProps) {
  const { data: tour, isLoading, isError, refetch } = useVirtualTour(tourId);
  const { parcels, panoramaCenter } = useParcelsForTour(tourId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentScene, setCurrentScene] = useState<VirtualTourScene | null>(null);
  const [sceneHistory, setSceneHistory] = useState<string[]>([]);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);

  // Tour preload hook for offline caching
  const { preload, progress, isPreloaded, isTourCached } = useTourPreload();
  const [isCheckingCache, setIsCheckingCache] = useState(false);

  // Check if tour is already cached when tour loads
  useEffect(() => {
    if (tour && tour.escenas.length > 0) {
      setIsCheckingCache(true);
      const sceneUrls = tour.escenas
        .flatMap((scene) => [scene.textureUrl, scene.textureUrlFallback].filter(Boolean))
        .filter((url): url is string => Boolean(url));
      
      isTourCached(sceneUrls).then((cached) => {
        if (cached) {
          // Tour is already fully cached
        }
        setIsCheckingCache(false);
      }).catch(() => {
        setIsCheckingCache(false);
      });
    }
  }, [tour, isTourCached]);

  const handleDownloadTour = useCallback(async () => {
    if (!tour) return;
    
    // Collect all unique scene URLs (texture + fallback + thumbnail)
    const sceneUrls = tour.escenas.flatMap((scene) => [
      scene.textureUrl,
      scene.textureUrlFallback,
      scene.thumbnailUrl,
    ]).filter((url): url is string => Boolean(url));

    await preload(sceneUrls);
  }, [tour, preload]);

  // Find initial scene when tour loads
  useEffect(() => {
    if (tour && tour.escenas.length > 0) {
      const initialScene =
        tour.escenas.find((s) => s.id === tour.escenaInicialId) ||
        tour.escenas[0];
      if (initialScene) {
        setCurrentScene(initialScene);
        setSceneHistory([initialScene.id]);
      }
    }
  }, [tour]);

  const handleFullscreenChange = useCallback((fs: boolean) => {
    setIsFullscreen(fs);
  }, []);

  const handleCanvasLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  const handleCanvasError = useCallback(
    (err: Error) => {
      onError?.(err);
    },
    [onError]
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleParcelClick = useCallback((lote: Lote) => {
    setSelectedLote(lote);
  }, []);

  const handleDetailClose = useCallback(() => {
    setSelectedLote(null);
  }, []);

  // Navigate to a scene by hotspot
  const navigateToScene = useCallback(
    (targetSceneId: string) => {
      if (!tour) return;
      const targetScene = tour.escenas.find((s) => s.id === targetSceneId);
      if (targetScene) {
        setCurrentScene(targetScene);
        setSceneHistory((prev) => [...prev, targetSceneId]);
      }
    },
    [tour]
  );

  // Navigate back
  const navigateBack = useCallback(() => {
    if (sceneHistory.length <= 1 || !tour) return;
    const newHistory = sceneHistory.slice(0, -1);
    const prevSceneId = newHistory[newHistory.length - 1];
    const prevScene = tour.escenas.find((s) => s.id === prevSceneId);
    if (prevScene) {
      setCurrentScene(prevScene);
      setSceneHistory(newHistory);
    }
  }, [sceneHistory, tour]);

  if (isLoading) {
    return <VirtualTourSkeleton className={className} />;
  }

  if (isError || !tour || !currentScene) {
    return (
      <VirtualTourErrorBoundary
        fallbackScene={tour?.escenas[0]?.thumbnailUrl}
        onRetry={handleRetry}
        tourId={tourId}
      >
        <div
          className={`${className} relative w-full aspect-video max-h-96 bg-muted rounded-xl overflow-hidden flex items-center justify-center`}
        >
          <div className="text-center p-4">
            <p className="text-destructive mb-2">Tour no disponible</p>
            <p className="text-muted-foreground text-sm mb-4">
              {isError
                ? "Error al cargar el tour"
                : "El tour no tiene escenas configuradas"}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </VirtualTourErrorBoundary>
    );
  }

  return (
    <VirtualTourErrorBoundary
      fallbackScene={currentScene.thumbnailUrl}
      onRetry={handleRetry}
      tourId={tourId}
    >
      <div className={`${className} relative`}>
        <Suspense fallback={<VirtualTourSkeleton className={className} />}>
          <VirtualTourCanvas
            scene={currentScene}
            onFullscreenChange={handleFullscreenChange}
            onLoad={handleCanvasLoad}
            onError={handleCanvasError}
            className={className}
            parcels={parcels}
            panoramaCenter={panoramaCenter}
            onParcelClick={handleParcelClick}
          />
        </Suspense>

        {/* Parcel detail panel */}
        <ParcelDetailPanel
          lote={selectedLote}
          tourId={tourId}
          isOpen={selectedLote !== null}
          onClose={handleDetailClose}
        />

        {/* Scene navigation bar */}
        {tour.escenas.length > 1 && (
          <div className="absolute bottom-16 left-0 right-0 z-30 flex justify-center">
            <div className="flex gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2">
              {tour.escenas.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => navigateToScene(scene.id)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                    currentScene.id === scene.id
                      ? "border-white scale-110"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  title={scene.id}
                >
                  <img
                    src={scene.thumbnailUrl}
                    alt={`Escena ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Back button (if history > 1) */}
        {sceneHistory.length > 1 && (
          <button
            onClick={navigateBack}
            className="absolute top-3 left-3 z-30 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
            title="Volver a escena anterior"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Download Tour Button */}
        {tour && (
          <div className="absolute top-3 right-3 z-30">
            <button
              onClick={handleDownloadTour}
              disabled={progress !== null || isCheckingCache}
              data-testid="download-tour-button"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg backdrop-blur-sm transition-all ${
                isPreloaded && !progress
                  ? "bg-green-600/90 text-white cursor-default"
                  : progress
                  ? "bg-blue-600/90 text-white cursor-wait"
                  : "bg-black/50 hover:bg-black/70 text-white"
              }`}
              title={isPreloaded ? "Tour descargado ✓" : progress ? `Descargando... ${progress.loaded}/${progress.total}` : "Descargar tour para uso offline"}
            >
              {progress ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span className="text-sm font-medium">{progress.loaded}/{progress.total}</span>
                </>
              ) : isCheckingCache ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : isPreloaded ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Descargado</span>
                </>
              ) : (
                <>
                  <Download className="size-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Descargar</span>
                </>
              )}
            </button>
          </div>
        )}

        {isFullscreen && (
          <VirtualTourCompass
            heading={0}
            visible={true}
            className="pointer-events-none"
          />
        )}
      </div>
    </VirtualTourErrorBoundary>
  );
}
