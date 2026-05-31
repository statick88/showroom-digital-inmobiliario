import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { HeaderNav } from "@/presentation/components/shared/HeaderNav";
import type { TabView } from "@/presentation/components/shared/HeaderNav";
import { env } from "@/config/env";
import { useProyecto } from "@/presentation/hooks/useProyectos";
import { AdminDashboard } from "@/presentation/components/admin/AdminDashboard";

const MapaLotes = lazy(() =>
  import("@/presentation/components/lotes/MapaLotes").then((m) => ({ default: m.MapaLotes })),
);

const FichaTecnicaLote = lazy(() =>
  import("@/presentation/components/lotes/FichaTecnicaLote").then((m) => ({
    default: m.FichaTecnicaLote,
  })),
);

type Route = "app" | "admin";

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  const [sessionChecked, setSessionChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const getRouteFromHash = (): Route => {
    const hash = window.location.hash.replace("#", "");
    return hash === "admin" || hash === "app" ? hash : "app";
  };

  const [route, setRoute] = useState<Route>(getRouteFromHash);
  const redirected = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session);
      setSessionChecked(true);
    });
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRouteFromHash());
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (sessionChecked && route === "admin" && !authenticated && !redirected.current) {
      redirected.current = true;
      window.location.hash = "#app";
      toast.error("Acceso restringido", {
        description: "Debes iniciar sesión para acceder al panel.",
      });
    }
  }, [sessionChecked, route, authenticated]);

  const effectiveRoute: Route =
    sessionChecked && route === "admin" && !authenticated ? "app" : route;

  if (effectiveRoute === "admin") {
    return (
      <QueryClientProvider client={queryClient}>
        <AdminDashboard />
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

function AppContent() {
  const [tab, setTab] = useState<TabView>("inicio");
  const [selectedLote, setSelectedLote] = useState<import("@/domain/entities/lote").Lote | null>(
    null,
  );
  const { data: proyecto } = useProyecto(env.proyectoId);

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav currentTab={tab} onTabChange={setTab} proyectoNombre={proyecto?.nombre} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tab === "lotizacion" && (
          <Suspense
            fallback={<div className="flex h-96 items-center justify-center">Cargando mapa...</div>}
          >
            <div className="h-[600px] rounded-xl overflow-hidden border border-border">
              <MapaLotes onLoteClick={setSelectedLote} />
            </div>
          </Suspense>
        )}

        {tab === "inicio" && (
          <div className="space-y-8">
            <h2 className="typo-headline-lg text-foreground">Bienvenido</h2>
            <p className="typo-body-lg text-muted-foreground">
              Explora nuestro proyecto de lotización.
            </p>
          </div>
        )}

        {tab === "ubicacion" && (
          <div className="space-y-8">
            <h2 className="typo-headline-lg text-foreground">Ubicación</h2>
            <p className="typo-body-md text-muted-foreground">
              El proyecto está ubicado en Ayacucho, Perú.
            </p>
          </div>
        )}

        {tab === "financiamiento" && (
          <div className="space-y-8">
            <h2 className="typo-headline-lg text-foreground">Financiamiento</h2>
            <p className="typo-body-md text-muted-foreground">
              Consulta nuestras opciones de financiamiento.
            </p>
          </div>
        )}
      </main>

      {selectedLote && (
        <Suspense fallback={null}>
          <FichaTecnicaLote lote={selectedLote} onClose={() => setSelectedLote(null)} />
        </Suspense>
      )}

      <footer className="border-t border-border mt-12 py-6 text-center">
        <p className="typo-label-md text-muted-foreground">
          &copy; {new Date().getFullYear()} — Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}
