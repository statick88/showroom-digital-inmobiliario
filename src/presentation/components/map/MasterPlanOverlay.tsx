"use client";

import { ImageOverlay } from "react-leaflet";
import { LatLngBounds } from "leaflet";

interface MasterPlanOverlayProps {
  imageUrl?: string;
  bounds?: [number, number][];
}

const DEFAULT_BOUNDS: [number, number][] = [
  [-12.138, -76.999],
  [-12.132, -76.994],
];

export function MasterPlanOverlay({ imageUrl, bounds }: MasterPlanOverlayProps) {
  if (!imageUrl) return null;

  const b = new LatLngBounds(bounds ?? DEFAULT_BOUNDS);

  return <ImageOverlay url={imageUrl} bounds={b} opacity={0.7} />;
}
