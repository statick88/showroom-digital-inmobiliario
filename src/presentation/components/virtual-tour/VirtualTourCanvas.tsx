"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import * as THREE from "three";
import type { VirtualTourScene } from "@/domain/entities/virtual-tour";

// Auto-rotating camera component
function AutoRotateCamera({
  enabled,
  speed = 0.001,
}: {
  enabled: boolean;
  speed?: number;
}) {
  useFrame(({ camera }) => {
    if (!enabled) return;
    camera.rotation.y += speed;
  });
  return null;
}

// Texture sphere with proper equirectangular mapping
function SphereWithTexture({
  scene,
  onLoad,
  onError,
}: {
  scene: VirtualTourScene;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  const texture = useLoader(
    THREE.TextureLoader,
    scene.textureUrlFallback ?? scene.textureUrl
  );

  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });

  if (material.map) {
    material.map.mapping = THREE.EquirectangularReflectionMapping;
    material.map.colorSpace = THREE.SRGBColorSpace;
  }

  return (
    <mesh
      geometry={new THREE.SphereGeometry(500, 60, 40)}
      material={material}
    />
  );
}

// Loading indicator
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-white/80 text-sm">Cargando escena...</span>
      </div>
    </div>
  );
}

interface VirtualTourCanvasProps {
  scene: VirtualTourScene;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function VirtualTourCanvas({
  scene,
  onFullscreenChange,
  onLoad,
  onError,
  className = "",
}: VirtualTourCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const step = 15;
      switch (e.key) {
        case "ArrowLeft":
          if (controlsRef.current) {
            controlsRef.current.minAzimuthAngle -= THREE.MathUtils.degToRad(step);
            controlsRef.current.maxAzimuthAngle -= THREE.MathUtils.degToRad(step);
          }
          break;
        case "ArrowRight":
          if (controlsRef.current) {
            controlsRef.current.minAzimuthAngle += THREE.MathUtils.degToRad(step);
            controlsRef.current.maxAzimuthAngle += THREE.MathUtils.degToRad(step);
          }
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "r":
        case "R":
          setAutoRotate((prev) => !prev);
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    containerRef.current?.addEventListener("keydown", handleKeyDown);
    return () => containerRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      onFullscreenChange?.(fs);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [onFullscreenChange]);

  // Reset auto-rotate when scene changes
  useEffect(() => {
    setIsLoading(true);
    setAutoRotate(true);
  }, [scene.id]);

  // Track user interaction to pause auto-rotate
  const handlePointerDown = useCallback(() => {
    setIsUserInteracting(true);
    setAutoRotate(false);
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsUserInteracting(false);
    // Resume auto-rotate after 3 seconds of no interaction
    setTimeout(() => {
      if (!isUserInteracting) {
        setAutoRotate(true);
      }
    }, 3000);
  }, [isUserInteracting]);

  return (
    <div
      ref={containerRef}
      className={`${className} relative w-full h-96 rounded-xl overflow-hidden bg-black`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {isLoading && <LoadingOverlay />}

      <Canvas
        camera={{ position: [0, 0, 0.1], fov: scene.fov }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ camera }) => {
          camera.position.set(0, 0, 0.1);
        }}
      >
        <Suspense fallback={null}>
          <SphereWithTexture
            scene={scene}
            onLoad={() => setIsLoading(false)}
            onError={onError}
          />
        </Suspense>

        <AutoRotateCamera enabled={autoRotate} speed={0.0008} />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={0.5}
          maxDistance={3}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={-0.3}
          zoomSpeed={0.5}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI - 0.2}
        />
      </Canvas>

      {/* Auto-rotate toggle button */}
      <button
        onClick={() => setAutoRotate((prev) => !prev)}
        className="absolute bottom-3 right-3 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
        title={autoRotate ? "Pausar rotación (R)" : "Rotar automáticamente (R)"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={autoRotate ? "animate-spin" : ""}
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      </button>

      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-3 right-12 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
        title="Pantalla completa (F)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {isFullscreen ? (
            <>
              <path d="M8 3v3a2 2 0 01-2 2H3" />
              <path d="M21 8h-3a2 2 0 01-2-2V3" />
              <path d="M3 16h3a2 2 0 012 2v3" />
              <path d="M16 21v-3a2 2 0 012-2h3" />
            </>
          ) : (
            <>
              <path d="M8 3H5a2 2 0 00-2 2v3" />
              <path d="M21 8V5a2 2 0 00-2-2h-3" />
              <path d="M3 16v3a2 2 0 002 2h3" />
              <path d="M16 21h3a2 2 0 002-2v-3" />
            </>
          )}
        </svg>
      </button>

      {/* Keyboard hints */}
      {!isFullscreen && (
        <div className="absolute bottom-3 left-3 z-20 flex gap-2 text-[10px] text-white/50">
          <span>F: fullscreen</span>
          <span>R: rotate</span>
          <span>←→: pan</span>
        </div>
      )}
    </div>
  );
}
