import { useState, useCallback } from "react";

const TOUR_CACHE = "tour-assets";

interface PreloadProgress {
  total: number;
  loaded: number;
}

export function useTourPreload() {
  const [progress, setProgress] = useState<PreloadProgress | null>(null);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preload = useCallback(async (sceneUrls: string[]) => {
    const cache = await caches.open(TOUR_CACHE);
    setProgress({ total: sceneUrls.length, loaded: 0 });
    setError(null);

    let loaded = 0;
    for (const url of sceneUrls) {
      try {
        await cache.add(url);
      } catch {
        // Skip failed URLs (CORS, etc.)
      }
      loaded++;
      setProgress({ total: sceneUrls.length, loaded });
    }

    setIsPreloaded(true);
  }, []);

  const isTourCached = useCallback(async (sceneUrls: string[]): Promise<boolean> => {
    const cache = await caches.open(TOUR_CACHE);
    const results = await Promise.all(sceneUrls.map((url) => cache.match(url)));
    return results.every(Boolean);
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    await caches.delete(TOUR_CACHE);
    setIsPreloaded(false);
    setProgress(null);
  }, []);

  return { preload, progress, isPreloaded, isTourCached, clearCache, error };
}