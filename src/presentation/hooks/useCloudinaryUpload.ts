"use client";

import { useState, useCallback } from "react";
import { uploadImage, getThumbnailUrl, type UploadResult } from "@/lib/cloudinary/client";

interface UseCloudinaryUploadOptions {
  folder: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

interface UseCloudinaryUploadReturn {
  upload: (file: File) => Promise<UploadResult | null>;
  isUploading: boolean;
  progress: number;
  error: Error | null;
  lastResult: UploadResult | null;
}

export function useCloudinaryUpload(
  options: UseCloudinaryUploadOptions
): UseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
      if (!validTypes.includes(file.type)) {
        const err = new Error("Formato no válido. Use JPEG, PNG, WebP o AVIF");
        setError(err);
        options.onError?.(err);
        return null;
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        const err = new Error("Archivo demasiado grande. Máximo 50MB");
        setError(err);
        options.onError?.(err);
        return null;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Simulate progress (Cloudinary REST API doesn't expose upload progress)
        const progressInterval = setInterval(() => {
          setProgress((p) => Math.min(p + 10, 90));
        }, 100);

        const result = await uploadImage(file, options.folder, {
          transformation: {
            quality: "auto",
            fetch_format: "auto",
          },
        });

        clearInterval(progressInterval);
        setProgress(100);

        setLastResult(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Error desconocido");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [options]
  );

  return {
    upload,
    isUploading,
    progress,
    error,
    lastResult,
  };
}

export function useTourImageUpload(sceneId: string) {
  return useCloudinaryUpload({
    folder: `tours/${sceneId}`,
    onSuccess: (result) => {
      console.log("[Cloudinary] Uploaded:", result.secureUrl);
    },
    onError: (error) => {
      console.error("[Cloudinary] Upload error:", error.message);
    },
  });
}

export { getThumbnailUrl } from "@/lib/cloudinary/client";
export type { UploadResult } from "@/lib/cloudinary/client";
