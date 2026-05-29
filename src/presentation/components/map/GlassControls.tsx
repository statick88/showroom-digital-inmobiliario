"use client";

import { MapController } from "./MapController";
import { Button } from "@/components/ui/button";
import { SearchIcon, MapPinIcon, GlobeAltIcon } from "lucide-react";

export function GlassControls() {
  return (
    <div className="absolute top-3 left-3 z-[1000] flex gap-2">
      <Button variant="ghost" size="icon" aria-label="Buscar ubicación">
        <SearchIcon className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Centrar en mi ubicación">
        <MapPinIcon className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Cambiar tipo de mapa">
        <GlobeAltIcon className="size-4" />
      </Button>
      <MapController />
    </div>
  );
}