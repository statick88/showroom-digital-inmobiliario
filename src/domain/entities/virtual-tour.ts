export type EstadoTour360 = "borrador" | "publicado" | "archivado";

export interface VirtualTourScene {
  id: string;
  textureUrl: string;           // KTX2 format preferred
  textureUrlFallback?: string;  // JPG/PNG fallback for browsers without KTX2 support
  thumbnailUrl: string;
  yaw: number;                  // Initial yaw in degrees
  pitch: number;                // Initial pitch in degrees
  fov: number;                  // Field of view in degrees
  hotspots?: VirtualTourHotspot[];
  panoramaCenter?: { lat: number; lng: number }; // Center coordinates for parcel overlay projection
}

export interface VirtualTourHotspot {
  id: string;
  yaw: number;
  pitch: number;
  targetSceneId: string;        // ID of the scene to navigate to
  label?: string;               // Optional label for the hotspot
  type?: "info" | "navigation" | "media"; // Type of hotspot
  content?: string;             // Additional content (HTML, text, media URL)
}

export interface VirtualTour {
  id: string;
  proyectoId: string;
  propiedadId?: string;
  nombre: string;
  descripcion?: string;
  escenas: VirtualTourScene[];
  escenaInicialId: string;
  metadatos: VirtualTourMetadatos;
  estado: EstadoTour360;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualTourMetadatos {
  author?: string;
  version?: string;
  captureDate?: string;
  cameraModel?: string;
  software?: string;
  [key: string]: unknown; // Allow extensible metadata
}

export interface CrearVirtualTourData {
  proyectoId: string;
  propiedadId?: string;
  nombre: string;
  descripcion?: string;
  escenas: VirtualTourScene[];
  escenaInicialId: string;
  metadatos?: VirtualTourMetadatos;
  estado?: EstadoTour360;
}

export interface ActualizarVirtualTourData {
  nombre?: string;
  descripcion?: string;
  escenas?: VirtualTourScene[];
  escenaInicialId?: string;
  metadatos?: VirtualTourMetadatos;
  estado?: EstadoTour360;
}

// Factory functions
export function createVirtualTourScene(data: Omit<VirtualTourScene, "id">): VirtualTourScene {
  return {
    id: crypto.randomUUID(),
    ...data,
  };
}

export function createVirtualTour(data: CrearVirtualTourData): VirtualTour {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    proyectoId: data.proyectoId,
    propiedadId: data.propiedadId,
    nombre: data.nombre,
    descripcion: data.descripcion,
    escenas: data.escenas,
    escenaInicialId: data.escenaInicialId,
    metadatos: data.metadatos ?? {},
    estado: data.estado ?? "borrador",
    createdAt: now,
    updatedAt: now,
  };
}

// Validation
export function validateVirtualTourScene(scene: VirtualTourScene): string[] {
  const errors: string[] = [];

  if (!scene.id) errors.push("Scene id is required");
  if (!scene.textureUrl) errors.push("Scene textureUrl is required");
  if (!scene.thumbnailUrl) errors.push("Scene thumbnailUrl is required");
  if (typeof scene.yaw !== "number" || Number.isNaN(scene.yaw)) errors.push("Scene yaw must be a number");
  if (typeof scene.pitch !== "number" || Number.isNaN(scene.pitch)) errors.push("Scene pitch must be a number");
  if (typeof scene.fov !== "number" || Number.isNaN(scene.fov) || scene.fov <= 0 || scene.fov > 180) {
    errors.push("Scene fov must be a number between 0 and 180");
  }

  if (scene.hotspots) {
    scene.hotspots.forEach((hotspot, index) => {
      if (!hotspot.id) errors.push(`Hotspot ${index}: id is required`);
      if (typeof hotspot.yaw !== "number" || Number.isNaN(hotspot.yaw)) {
        errors.push(`Hotspot ${index}: yaw must be a number`);
      }
      if (typeof hotspot.pitch !== "number" || Number.isNaN(hotspot.pitch)) {
        errors.push(`Hotspot ${index}: pitch must be a number`);
      }
      if (!hotspot.targetSceneId) errors.push(`Hotspot ${index}: targetSceneId is required`);
    });
  }

  return errors;
}

export function validateVirtualTour(tour: VirtualTour): string[] {
  const errors: string[] = [];

  if (!tour.id) errors.push("Tour id is required");
  if (!tour.proyectoId) errors.push("Tour proyectoId is required");
  if (!tour.nombre?.trim()) errors.push("Tour nombre is required");
  if (!tour.escenas || tour.escenas.length === 0) errors.push("Tour must have at least one scene");
  if (!tour.escenaInicialId) errors.push("Tour escenaInicialId is required");
  if (!tour.escenas.some((s) => s.id === tour.escenaInicialId)) {
    errors.push("escenaInicialId must match one of the scene IDs");
  }
  if (!["borrador", "publicado", "archivado"].includes(tour.estado)) {
    errors.push("Invalid estado value");
  }

  // Validate each scene
  tour.escenas.forEach((scene, index) => {
    const sceneErrors = validateVirtualTourScene(scene);
    sceneErrors.forEach((e) => errors.push(`Scene ${index}: ${e}`));
  });

  return errors;
}
