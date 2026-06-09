import { v2 as cloudinary } from "cloudinary";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "dnqm7moqd";
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY ?? "";
const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET ?? "";

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImage(
  file: File,
  folder: string,
  options?: {
    transformation?: Record<string, unknown>;
    tags?: string[];
  }
): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: options?.transformation ?? {
          quality: "auto",
          fetch_format: "auto",
        },
        tags: options?.tags ?? [],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        if (!result) {
          reject(new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(new Error(`Cloudinary delete failed: ${error.message}`));
        return;
      }
      resolve();
    });
  });
}

export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number | "auto";
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
  }
): string {
  const transformations: Record<string, unknown>[] = [];

  if (options?.width || options?.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: "fill",
      gravity: "auto",
    });
  }

  if (options?.quality) {
    transformations.push({ quality: options.quality });
  }

  if (options?.format) {
    transformations.push({ fetch_format: options.format });
  }

  return cloudinary.url(publicId, {
    transformation: transformations.length > 0 ? transformations : undefined,
    secure: true,
  });
}

export function getThumbnailUrl(publicId: string, size = 300): string {
  return getOptimizedUrl(publicId, {
    width: size,
    height: size,
    quality: 80,
    format: "webp",
  });
}