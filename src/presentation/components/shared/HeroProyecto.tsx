"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Tour360 } from "@/presentation/components/map/Tour360";

interface HeroProyectoProps {
  nombre?: string;
  descripcion?: string;
  imagenUrl?: string;
  imagenes360?: string[];
}

export function HeroProyecto({ nombre, descripcion, imagenUrl, imagenes360 }: HeroProyectoProps) {
  const [showTour, setShowTour] = useState(false);

  return (
    <>
      <section className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden">
        {imagenUrl ? (
          <img src={imagenUrl} alt={nombre ?? "Proyecto"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
            <Icon name="landscape" size={64} className="text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          {nombre && <h1 className="typo-headline-lg text-white mb-2 drop-shadow-lg">{nombre}</h1>}
          {descripcion && (
            <p className="typo-body-lg text-white/90 max-w-xl drop-shadow">{descripcion}</p>
          )}
          {imagenes360 && imagenes360.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTour(true)}
              className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl typo-label-md font-bold hover:bg-white/30 transition-all"
            >
              <Icon name="360" size={20} />
              Ver tour 360°
            </button>
          )}
        </div>
      </section>

      {showTour && imagenes360 && imagenes360.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/70 p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Tour 360°"
        >
          <div className="max-w-5xl mx-auto rounded-2xl bg-card p-4 sm:p-6">
            <Tour360
              imagenes={imagenes360}
              titulo={nombre ? `Tour 360° — ${nombre}` : "Tour 360°"}
              onClose={() => setShowTour(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
