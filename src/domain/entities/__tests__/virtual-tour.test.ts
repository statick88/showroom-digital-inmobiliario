import { describe, it, expect } from "vitest";
import {
  createVirtualTour,
  createVirtualTourScene,
  validateVirtualTour,
  validateVirtualTourScene,
  type VirtualTour,
  type VirtualTourScene,
  type EstadoTour360,
} from "../virtual-tour";

describe("virtual-tour entities", () => {
  describe("createVirtualTourScene", () => {
    it("creates a scene with auto-generated UUID", () => {
      const scene = createVirtualTourScene({
        textureUrl: "https://cdn.example.com/scene.ktx2",
        thumbnailUrl: "https://cdn.example.com/thumb.jpg",
        yaw: 0,
        pitch: 0,
        fov: 90,
      });

      expect(scene.id).toBeDefined();
      expect(scene.textureUrl).toBe("https://cdn.example.com/scene.ktx2");
      expect(scene.thumbnailUrl).toBe("https://cdn.example.com/thumb.jpg");
      expect(scene.yaw).toBe(0);
      expect(scene.pitch).toBe(0);
      expect(scene.fov).toBe(90);
    });

    it("includes optional fallback and hotspots", () => {
      const scene = createVirtualTourScene({
        textureUrl: "https://cdn.example.com/scene.ktx2",
        textureUrlFallback: "https://cdn.example.com/scene.jpg",
        thumbnailUrl: "https://cdn.example.com/thumb.jpg",
        yaw: 45,
        pitch: -10,
        fov: 80,
        hotspots: [
          {
            id: "hs-1",
            yaw: 90,
            pitch: 0,
            targetSceneId: "scene-2",
            label: "Next Room",
          },
        ],
      });

      expect(scene.textureUrlFallback).toBe("https://cdn.example.com/scene.jpg");
      expect(scene.hotspots).toHaveLength(1);
      expect(scene.hotspots?.[0]?.label).toBe("Next Room");
    });
  });

  describe("createVirtualTour", () => {
    it("creates a tour with all required fields", () => {
      const scenes = [
        createVirtualTourScene({
          textureUrl: "https://cdn.example.com/scene1.ktx2",
          thumbnailUrl: "https://cdn.example.com/thumb1.jpg",
          yaw: 0,
          pitch: 0,
          fov: 90,
        }),
      ];

      const firstScene = scenes[0];
      expect(firstScene).toBeDefined();

      const tour = createVirtualTour({
        proyectoId: "proy-1",
        nombre: "Tour Principal",
        descripcion: "Tour de la casa modelo",
        escenas: scenes,
        escenaInicialId: firstScene!.id,
        metadatos: { author: "Photographer", version: "1.0" },
        estado: "publicado",
      });

      expect(tour.id).toBeDefined();
      expect(tour.proyectoId).toBe("proy-1");
      expect(tour.nombre).toBe("Tour Principal");
      expect(tour.descripcion).toBe("Tour de la casa modelo");
      expect(tour.escenas).toHaveLength(1);
      expect(tour.escenaInicialId).toBe(firstScene!.id);
      expect(tour.metadatos).toEqual({ author: "Photographer", version: "1.0" });
      expect(tour.estado).toBe("publicado");
      expect(tour.createdAt).toBeDefined();
      expect(tour.updatedAt).toBeDefined();
    });

    it("defaults estado to borrador when not provided", () => {
      const scenes = [
        createVirtualTourScene({
          textureUrl: "https://cdn.example.com/scene.ktx2",
          thumbnailUrl: "https://cdn.example.com/thumb.jpg",
          yaw: 0,
          pitch: 0,
          fov: 90,
        }),
      ];

      const firstScene = scenes[0];
      expect(firstScene).toBeDefined();

      const tour = createVirtualTour({
        proyectoId: "proy-1",
        nombre: "Tour Borrador",
        escenas: scenes,
        escenaInicialId: firstScene!.id,
      });

      expect(tour.estado).toBe("borrador");
    });
  });

  describe("validateVirtualTourScene", () => {
    it("returns no errors for valid scene", () => {
      const scene: VirtualTourScene = {
        id: "scene-1",
        textureUrl: "https://cdn.example.com/scene.ktx2",
        thumbnailUrl: "https://cdn.example.com/thumb.jpg",
        yaw: 0,
        pitch: 0,
        fov: 90,
      };

      const errors = validateVirtualTourScene(scene);
      expect(errors).toHaveLength(0);
    });

    it("returns errors for missing required fields", () => {
      const scene = {
        id: "",
        textureUrl: "",
        thumbnailUrl: "",
        yaw: NaN,
        pitch: NaN,
        fov: NaN,
      } as VirtualTourScene;

      const errors = validateVirtualTourScene(scene);
      expect(errors).toContain("Scene id is required");
      expect(errors).toContain("Scene textureUrl is required");
      expect(errors).toContain("Scene thumbnailUrl is required");
      expect(errors).toContain("Scene yaw must be a number");
      expect(errors).toContain("Scene pitch must be a number");
      expect(errors).toContain("Scene fov must be a number between 0 and 180");
    });

    it("returns error for invalid fov range", () => {
      const scene: VirtualTourScene = {
        id: "scene-1",
        textureUrl: "https://cdn.example.com/scene.ktx2",
        thumbnailUrl: "https://cdn.example.com/thumb.jpg",
        yaw: 0,
        pitch: 0,
        fov: 200, // Invalid - exceeds 180
      };

      const errors = validateVirtualTourScene(scene);
      expect(errors).toContain("Scene fov must be a number between 0 and 180");
    });

    it("validates hotspots", () => {
      const scene: VirtualTourScene = {
        id: "scene-1",
        textureUrl: "https://cdn.example.com/scene.ktx2",
        thumbnailUrl: "https://cdn.example.com/thumb.jpg",
        yaw: 0,
        pitch: 0,
        fov: 90,
        hotspots: [
          { id: "", yaw: NaN, pitch: NaN, targetSceneId: "" },
        ],
      };

      const errors = validateVirtualTourScene(scene);
      expect(errors).toContain("Hotspot 0: id is required");
      expect(errors).toContain("Hotspot 0: yaw must be a number");
      expect(errors).toContain("Hotspot 0: pitch must be a number");
      expect(errors).toContain("Hotspot 0: targetSceneId is required");
    });
  });

  describe("validateVirtualTour", () => {
    const validScene: VirtualTourScene = {
      id: "scene-1",
      textureUrl: "https://cdn.example.com/scene.ktx2",
      thumbnailUrl: "https://cdn.example.com/thumb.jpg",
      yaw: 0,
      pitch: 0,
      fov: 90,
    };

    it("returns no errors for valid tour", () => {
      const tour: VirtualTour = {
        id: "tour-1",
        proyectoId: "proy-1",
        nombre: "Valid Tour",
        escenas: [validScene],
        escenaInicialId: "scene-1",
        metadatos: {},
        estado: "publicado",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const errors = validateVirtualTour(tour);
      expect(errors).toHaveLength(0);
    });

    it("returns errors for missing required fields", () => {
      const tour = {
        id: "",
        proyectoId: "",
        nombre: "",
        escenas: [],
        escenaInicialId: "",
        metadatos: {},
        estado: "invalid" as EstadoTour360,
        createdAt: "",
        updatedAt: "",
      } as VirtualTour;

      const errors = validateVirtualTour(tour);
      expect(errors).toContain("Tour id is required");
      expect(errors).toContain("Tour proyectoId is required");
      expect(errors).toContain("Tour nombre is required");
      expect(errors).toContain("Tour must have at least one scene");
      expect(errors).toContain("Tour escenaInicialId is required");
      expect(errors).toContain("Invalid estado value");
    });

    it("returns error when escenaInicialId doesn't match any scene", () => {
      const tour: VirtualTour = {
        id: "tour-1",
        proyectoId: "proy-1",
        nombre: "Tour",
        escenas: [validScene],
        escenaInicialId: "non-existent-scene",
        metadatos: {},
        estado: "borrador",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const errors = validateVirtualTour(tour);
      expect(errors).toContain("escenaInicialId must match one of the scene IDs");
    });

    it("validates nested scenes", () => {
      const tour: VirtualTour = {
        id: "tour-1",
        proyectoId: "proy-1",
        nombre: "Tour",
        escenas: [
          { ...validScene, id: "scene-1", textureUrl: "" }, // Invalid scene
        ],
        escenaInicialId: "scene-1",
        metadatos: {},
        estado: "borrador",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const errors = validateVirtualTour(tour);
      expect(errors).toContain("Scene 0: Scene textureUrl is required");
    });
  });
});
