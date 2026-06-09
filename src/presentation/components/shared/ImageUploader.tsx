import { useCallback, useState } from "react";
import { useImageUpload } from "@/presentation/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  accept?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = "tours",
  label = "Subir imagen",
  accept = "image/jpeg,image/png,image/webp",
}: ImageUploaderProps) {
  const { upload, isUploading, error, reset } = useImageUpload();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const result = await upload(file, folder);
      if (result) {
        onChange(result.url);
      }
    },
    [upload, folder, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleClear = useCallback(() => {
    onChange("");
    reset();
  }, [onChange, reset]);

  if (value) {
    return (
      <div className="relative group">
        <img
          src={value}
          alt="Preview"
          className="w-full h-32 object-cover rounded-lg border border-border"
        />
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-2 right-2 p-1 bg-destructive/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        dragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <Loader2 size={24} className="text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">Subiendo...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-2">
          <ImageIcon size={24} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Arrastra o haz click para {label.toLowerCase()}
          </span>
          <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP (max 50MB)</span>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
