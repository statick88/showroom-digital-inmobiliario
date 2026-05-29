"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapController({ flyTo }: { flyTo?: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 16, { duration: 0.6 });
    }
  }, [flyTo, map]);

  return null;
}
