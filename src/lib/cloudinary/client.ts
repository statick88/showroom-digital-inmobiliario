/**
 * Cloudinary browser-native client.
 *
 * Uses the REST API directly — no Node.js SDK.
 * Requires an unsigned upload preset configured in Cloudinary dashboard:
 *   Settings → Upload → Upload presets → Add upload preset
 *   - Preset name: "showroom-unsigned"
 *   - Signing mode: "Unsigned"
 *   - Folder: (optional, can be set per-request)
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "dnqm7moqd";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "showroom-unsigned";

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload an image to Cloudinary via browser REST API (unsigned).
 */
export async function uploadImage(
  file: File,
  folder: string,
  options?: {
    transformation?: Record<string, unknown>;
    tags?: string[];
  }
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);
  formData.append("resource_type", "image");

  // Add tags if provided
  if (options?.tags && options.tags.length > 0) {
    formData.append("tags", options.tags.join(","));
  }

  // Add transformation as a stringified JSON
  if (options?.transformation) {
    // Cloudinary accepts transformation as a JSON string in unsigned uploads
    // but for simplicity, we use the eager_transformation param
    const t = options.transformation;
    const parts: string[] = [];
    if (t.width) parts.push(`w_${t.width}`);
    if (t.height) parts.push(`h_${t.height}`);
    if (t.quality) parts.push(`q_${t.quality}`);
    if (t.fetch_format) parts.push(`f_${t.fetch_format}`);
    if (t.crop) parts.push(`c_${t.crop}`);
    if (parts.length > 0) {
      formData.append("eager", parts.join(","));
    }
  }

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData?.error?.message ?? `Upload failed (${response.status})`;
    throw new Error(`Cloudinary upload failed: ${msg}`);
  }

  const result = await response.json();

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Delete an image from Cloudinary.
 *
 * IMPORTANT: Unsigned uploads cannot be deleted from the browser.
 * This requires server-side authentication. For now, this is a no-op
 * that logs a warning. Implement a server endpoint for production use.
 */
export async function deleteImage(_publicId: string): Promise<void> {
  console.warn(
    "[Cloudinary] deleteImage called but unsigned uploads cannot be deleted from browser. " +
    "Implement a server endpoint for deletion."
  );
  // TODO: Create a Supabase Edge Function or server endpoint for deletion
  // that uses the API secret server-side.
}

/**
 * Generate a Cloudinary URL with transformations.
 * No API call needed — just URL construction.
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number | "auto";
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
  }
): string {
  const parts: string[] = [];

  // Add transformation parameters
  if (options?.width) parts.push(`w_${options.width}`);
  if (options?.height) parts.push(`h_${options.height}`);
  if (options?.width || options?.height) {
    parts.push("c_fill");
    parts.push("g_auto");
  }
  if (options?.quality) parts.push(`q_${options.quality}`);
  if (options?.format) parts.push(`f_${options.format}`);

  const transformation = parts.length > 0 ? parts.join(",") + "/" : "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}${publicId}`;
}

/**
 * Generate a thumbnail URL for a given public ID.
 */
export function getThumbnailUrl(publicId: string, size = 300): string {
  return getOptimizedUrl(publicId, {
    width: size,
    height: size,
    quality: 80,
    format: "webp",
  });
}
