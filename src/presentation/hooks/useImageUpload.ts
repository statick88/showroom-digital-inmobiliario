import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

interface UploadResult {
  url: string;
  path: string;
}

interface UseImageUploadReturn {
  upload: (file: File, folder?: string) => Promise<UploadResult | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export function useImageUpload(bucket = "tour-images"): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File, folder = "general"): Promise<UploadResult | null> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Generate unique filename
        const ext = file.name.split(".").pop() ?? "jpg";
        const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        // Upload file
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        setProgress(50);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        setProgress(100);

        return {
          url: urlData.publicUrl,
          path: data.path,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al subir imagen";
        setError(message);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [bucket],
  );

  return { upload, isUploading, progress, error, reset };
}
