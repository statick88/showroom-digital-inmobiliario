// Cloudinary seed script for sample project images
// Run with: npx tsx scripts/seed-cloudinary.ts
//
// Uses Cloudinary REST API with signed uploads (server-side only).

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.warn("Could not read .env.local, using environment variables");
}

import crypto from "crypto";

const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME ?? "dnqm7moqd";
const API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

if (!API_KEY || !API_SECRET) {
  console.error("Error: CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set in .env.local");
  process.exit(1);
}

function createSignature(params: Record<string, string | number>): string {
  // Cloudinary signs params excluding file, api_key, and resource_type
  const sorted = Object.keys(params)
    .sort()
    .filter((k) => k !== "api_key" && k !== "file" && k !== "resource_type")
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(sorted + API_SECRET).digest("hex");
}

async function uploadFromUrl(
  url: string,
  folder: string,
  tags: string[]
): Promise<{ public_id: string; secure_url: string }> {
  // Fetch the image
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${url}`);
  const blob = await response.blob();

  // Build form data for signed upload
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = {
    folder,
    resource_type: "image",
    tags: tags.join(","),
    timestamp,
  };
  params.eager = "q_auto,f_auto";
  const signature = createSignature(params);

  const formData = new FormData();
  formData.append("file", blob);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("resource_type", "image");
  formData.append("tags", tags.join(","));
  formData.append("eager", "q_auto,f_auto");

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadResponse.ok) {
    const err = await uploadResponse.json().catch(() => ({}));
    throw new Error(`Upload failed: ${JSON.stringify(err)}`);
  }

  return uploadResponse.json();
}

// Sample real estate images from Unsplash (free to use)
const SAMPLE_IMAGES = [
  // Hero images for projects
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    folder: "projects/hero",
    tags: ["hero", "project"],
  },
  {
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
    folder: "projects/hero",
    tags: ["hero", "project"],
  },
  {
    url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80",
    folder: "projects/hero",
    tags: ["hero", "project"],
  },
  // Interior / tour preview images
  {
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80",
    folder: "tours/scene-1",
    tags: ["tour", "360", "scene-1"],
  },
  {
    url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=80",
    folder: "tours/scene-2",
    tags: ["tour", "360", "scene-2"],
  },
  {
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80",
    folder: "tours/scene-3",
    tags: ["tour", "360", "scene-3"],
  },
];

async function seedProjectImages() {
  console.log("Subiendo imágenes de muestra a Cloudinary...\n");

  const results: { folder: string; public_id: string; secure_url: string }[] = [];

  for (const img of SAMPLE_IMAGES) {
    try {
      const result = await uploadFromUrl(img.url, img.folder, img.tags);
      console.log(`✅ ${img.folder}/${result.public_id}: ${result.secure_url}`);
      results.push({ folder: img.folder, public_id: result.public_id, secure_url: result.secure_url });
    } catch (err) {
      console.error(`❌ ${img.folder}:`, err);
    }
  }

  console.log("\n--- RESULTADOS PARA SUPABASE ---");
  console.log("Actualizá la tabla 'proyectos' con estas URLs:\n");

  const heroImages = results.filter((r) => r.folder.includes("hero"));
  const tourImages = results.filter((r) => r.folder.includes("tour"));

  if (heroImages.length > 0) {
    console.log("-- imagenHero (URLs):");
    heroImages.forEach((r, i) => console.log(`  Proyecto ${i + 1}: ${r.secure_url}`));
  }

  if (tourImages.length > 0) {
    console.log("\n-- imagenes360 (array de URLs):");
    tourImages.forEach((r) => console.log(`  ${r.secure_url}`));
  }

  console.log("\n-- Ejemplo SQL para actualizar proyecto:");
  if (heroImages[0]) {
    console.log(`UPDATE proyectos SET imagen_hero = '${heroImages[0].secure_url}' WHERE id = 'TU_PROYECTO_ID';`);
  }

  return results;
}

seedProjectImages().catch(console.error);
