"use client";

import dynamic from "next/dynamic";

const DynamicMap = dynamic(
  () => import("@/presentation/components/map/MapView").then((m) => ({ default: m.MapView })),
  { ssr: false },
);

export function MapPageClient() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <header className="w-full max-w-7xl px-4 pt-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Showroom Digital Inmobiliario
        </h1>
        <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
          Explora propiedades disponibles en Perú
        </p>
      </header>
      <main className="w-full max-w-7xl flex-1 px-4 pb-8">
        <DynamicMap />
      </main>
    </div>
  );
}
