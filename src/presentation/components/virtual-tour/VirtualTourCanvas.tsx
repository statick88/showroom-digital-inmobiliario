"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  DeviceOrientationControls,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import * as THREE from "three";
import type { VirtualTourScene } from "@/domain/entities/virtual-tour";

// Texture loader component using useLoader
function SphereWithTexture({ 
  scene, 
  onLoad, 
  onError 
}: { 
  scene: VirtualTourScene; 
  onLoad?: () => void; 
  onError?: (error: Error) => void;
}) {
  const texture = useLoader(
    THREE.TextureLoader,
    scene.textureUrlFallback ?? scene.textureUrl
  );

  // Call onLoad when texture is ready (useLoader handles this)
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  // Material with proper texture configuration
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });

  // Configure texture mapping on material level
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentYaw, setCurrentYaw] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);

  // Fullscreen handling - defined before use
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
      const step = 15; // degrees
      switch (e.key) {
        case "ArrowLeft":
          setCurrentYaw((y) => y + step);
          break;
        case "ArrowRight":
          setCurrentYaw((y) => y - step);
          break;
        case "ArrowUp":
          setCurrentPitch((p) => Math.min(90, p + 10));
          break;
        case "ArrowDown":
          setCurrentPitch((p) => Math.max(-90, p - 10));
          break;
        case "f":
        case "F":
          toggleFullscreen();
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

  // Sync yaw/pitch with scene props
  /* eslint-disable */
  useEffect(() => {
    setCurrentYaw(scene.yaw);
    setCurrentPitch(scene.pitch);
  }, [scene.yaw, scene.pitch]);
  /* eslint-enable */

  return (
    <div
      ref={containerRef}
      className={`${className} relative w-full h-96 rounded-xl overflow-hidden bg-black`}
      tabIndex={0}
    >
      <Canvas
        camera={{ position: [0, 0, 0.1], fov: scene.fov }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ camera }) => {
          camera.position.set(0, 0, 0.1);
        }}
      >
        <Environment
          background={false}
          files={scene.textureUrlFallback ?? scene.textureUrl}
          preset="warehouse"
        />
        <Suspense fallback={null}>
          <SphereWithTexture scene={scene} onLoad={onLoad} onError={onError} />
        </Suspense>
        <DeviceOrientationControls />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minZoom={0.5}
          maxZoom={2}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
}