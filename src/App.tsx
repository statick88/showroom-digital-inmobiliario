import { useState, useEffect, useRef, Suspense, lazy, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { HeaderNav } from "@/presentation/components/shared/HeaderNav";
import { HeroProyecto } from "@/presentation/components/shared/HeroProyecto";
import { Navbar } from "@/presentation/components/shared/Navbar";
import type { Route } from "@/presentation/components/shared/Navbar";
import type { TabView } from "@/presentation/components/shared/HeaderNav";
import { env } from "@/config/env";
import { useProyecto } from "@/presentation/hooks/useProyectos";
import { useVirtualToursByProyecto } from "@/presentation/hooks/use-virtual-tour";
import { AdminDashboard } from "@/presentation/components/admin/AdminDashboard";
import { CookieBanner } from "@/presentation/components/shared/CookieBanner";
import { MapView } from "@/presentation/components/map/MapView";
import { RoleGuard } from "@/presentation/components/auth/RoleGuard";
import { VendedorPanel } from "@/presentation/components/vendedor/VendedorPanel";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import { usuariosRepository } from "@/data/repositories";
import { UbicacionMapa } from "@/presentation/components/map/UbicacionMapa";
import { AuthPage } from "@/presentation/components/auth/AuthPage";
import { MisionVision } from "@/presentation/components/landing/MisionVision";
import { TourPreview } from "@/presentation/components/landing/TourPreview";
import { Contacto } from "@/presentation/components/landing/Contacto";
import { LandingFooter } from "@/presentation/components/landing/LandingFooter";
import { PWAInstallPrompt } from "@/presentation/components/ui/PWAInstallPrompt";
import { AlertTriangle } from "lucide-react";

// ── Error Boundary (Task 6) ──────────────────────────────────────
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <AlertTriangle className="size-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Algo salió mal</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ocurrió un error inesperado. Por favor, intenta de nuevo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all"
            >
              Reintentar
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

const MapaLotes = lazy(() =>
  import("@/presentation/components/lotes/MapaLotes").then((m) => ({ default: m.MapaLotes })),
);

const FichaTecnicaLote = lazy(() =>
  import("@/presentation/components/lotes/FichaTecnicaLote").then((m) => ({
    default: m.FichaTecnicaLote,
  })),
);

// Route type is now imported from Navbar component

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
    if (
      hash === "admin" ||
      hash === "app" ||
      hash === "showroom" ||
      hash === "privacidad" ||
      hash === "vendedor" ||
      hash === "auth"
    )
      return hash;
    return "showroom";
  };

  const [route, setRoute] = useState<Route>(getRouteFromHash);
  const redirected = useRef(false);
  const adminToastShown = useRef(false);
  const vendedorToastShown = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setAuthenticated(!!data.session);
      setSessionChecked(true);
      // Hydrate the auth store from the session so RoleGuard can decide
      // on the very first render (avoids the redirect-toast flash).
      if (data.session?.user?.id) {
        const row = await usuariosRepository.getByAuthUserId(data.session.user.id);
        if (row) {
          useAuthStore.getState().setFromUsuariosRol(row, { sessionChecked: true });
        } else {
          // Session exists but no `usuarios_rol` row — treat as anon.
          useAuthStore.getState().reset();
        }
      }
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
      window.location.hash = "#showroom";
      if (!adminToastShown.current) {
        adminToastShown.current = true;
        toast.error("Acceso restringido", {
          description: "Debes iniciar sesión para acceder al panel.",
        });
      }
    }
  }, [sessionChecked, route, authenticated]);

  useEffect(() => {
    if (sessionChecked && route === "vendedor" && !authenticated && !vendedorToastShown.current) {
      vendedorToastShown.current = true;
      window.location.hash = "#showroom";
      toast.error("Acceso restringido", {
        description: "Debes iniciar sesión para acceder al panel de vendedor.",
      });
    }
  }, [sessionChecked, route, authenticated]);

  const effectiveRoute: Route =
    sessionChecked && route === "admin" && !authenticated ? "showroom" : route;

  const handleNavigate = (target: Route) => {
    window.location.hash = `#${target}`;
  };

  // Auth route: show AuthPage
  if (effectiveRoute === "auth") {
    return (
      <QueryClientProvider client={queryClient}>
        <SkipToContent />
        <AuthPage
          onLogin={() => {
            window.location.hash = "#showroom";
          }}
        />
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (effectiveRoute === "admin") {
    return (
      <QueryClientProvider client={queryClient}>
        <SkipToContent />
        <ErrorBoundary>
          <AdminDashboard />
        </ErrorBoundary>
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (effectiveRoute === "vendedor") {
    return (
      <QueryClientProvider client={queryClient}>
        <SkipToContent />
        <ErrorBoundary>
          <RoleGuard rol="vendedor">
            <div className="min-h-screen bg-background">
              <Navbar
                currentRoute="vendedor"
                onNavigate={handleNavigate}
                isAuthenticated={authenticated}
              />
              <div id="main-content" tabIndex={-1}>
                <VendedorPanel />
              </div>
            </div>
          </RoleGuard>
        </ErrorBoundary>
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (effectiveRoute === "showroom") {
    return (
      <QueryClientProvider client={queryClient}>
        <SkipToContent />
        <ErrorBoundary>
          <div className="min-h-screen bg-background">
            <Navbar
              currentRoute="showroom"
              onNavigate={handleNavigate}
              isAuthenticated={authenticated}
            />
            <div id="main-content" tabIndex={-1}>
              <MapView />
            </div>
          </div>
        </ErrorBoundary>
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (effectiveRoute === "privacidad") {
    return (
      <QueryClientProvider client={queryClient}>
        <SkipToContent />
        <ErrorBoundary>
          <PrivacidadPage
            onBack={() => {
              window.location.hash = "#showroom";
            }}
          />
        </ErrorBoundary>
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SkipToContent />
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  );
}

// ── Skip-to-content link (Task 1) ────────────────────────────────
function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg"
    >
      Saltar al contenido principal
    </a>
  );
}

function PrivacidadPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          ← Volver al showroom
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-8">Última actualización: Mayo 2026</p>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Datos del Responsable</h2>
            <p>
              El responsable del tratamiento de datos personales es el titular del Showroom Digital
              Inmobiliario, con domicilio en Lima, Perú. Puedes contactarnos a través del formulario
              de contacto en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Datos Recopilados</h2>
            <p>
              Recopilamos los siguientes datos personales a través de nuestro formulario de
              contacto:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Finalidad del Tratamiento</h2>
            <p>Los datos personales proporcionados serán utilizados para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Gestionar las solicitudes de información sobre propiedades</li>
              <li>Contactar al usuario en respuesta a su solicitud</li>
              <li>Mantener un historial de consultas para mejora del servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Base Legal</h2>
            <p>
              El tratamiento de datos se basa en el consentimiento explícito del usuario, otorgado
              mediante la casilla de verificación en el formulario de contacto, conforme a la Ley N°
              29733 — Ley de Protección de Datos Personales del Perú y su reglamento DS
              016-2024-JUS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Derechos del Titular</h2>
            <p>El titular de los datos tiene derecho a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Acceder a sus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Cancelar o suprimir sus datos</li>
              <li>Oponerse al tratamiento de sus datos</li>
              <li>Solicitar la portabilidad de sus datos</li>
            </ul>
            <p className="mt-2">
              Para ejercer estos derechos, contacta a través del formulario de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Plazo de Conservación</h2>
            <p>
              Los datos personales se conservarán durante el tiempo necesario para cumplir con la
              finalidad del tratamiento, y posteriormente por 2 años para fines estadísticos o hasta
              que el titular solicite su cancelación.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizativas para proteger los datos personales
              contra acceso no autorizado, pérdida o destrucción, incluyendo cifrado en tránsito
              (HTTPS) y almacenamiento seguro en infraestructura cloud.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Uso de Cookies</h2>
            <p>
              Utilizamos cookies esenciales para el funcionamiento de la plataforma y cookies
              analíticas para mejorar la experiencia del usuario. Puedes gestionar tus preferencias
              de cookies a través del banner informativo que se muestra en tu primera visita.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <button
            onClick={onBack}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [tab, setTab] = useState<TabView>("inicio");
  const [selectedLote, setSelectedLote] = useState<import("@/domain/entities/lote").Lote | null>(
    null,
  );
  const { data: proyecto } = useProyecto(env.proyectoId);
  const { data: virtualTours } = useVirtualToursByProyecto(proyecto?.id);
  const tourId = virtualTours?.[0]?.id; // Use the first virtual tour for this project
  // T-4.4: when the signed-in user is a vendedor or admin, the ficha
  // opens in vendor mode so the Reservar / Vender buttons are visible.
  const rol = useAuthStore((s) => s.rol);
  const authenticated = useAuthStore((s) => s.sessionChecked && s.authUserId !== null);
  const modoVendedor = rol === "vendedor" || rol === "admin";

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentRoute="app"
        onNavigate={(route) => {
          window.location.hash = `#${route}`;
        }}
        isAuthenticated={authenticated}
        proyectoNombre={proyecto?.nombre}
      />

      <HeaderNav currentTab={tab} onTabChange={setTab} />

      <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
          <div className="space-y-0">
            <HeroProyecto
              nombre={proyecto?.nombre}
              descripcion={proyecto?.descripcion ?? "Explora nuestro proyecto de lotización."}
              imagenUrl={proyecto?.imagenHero}
              imagenes360={proyecto?.imagenes360}
              tourId={tourId}
            />
            <MisionVision />
            <TourPreview
              tourId={tourId}
              projectName={proyecto?.nombre}
            />
            <Contacto />
            <LandingFooter projectName={proyecto?.nombre} />
          </div>
        )}

        {tab === "ubicacion" && (
          <div className="space-y-8">
            <h2 className="typo-headline-lg text-foreground">Ubicación</h2>
            <p className="typo-body-md text-muted-foreground">
              El proyecto está ubicado en Ayacucho, Perú.
            </p>
            {proyecto?.coordenadasCentro && (
              <UbicacionMapa
                lat={proyecto.coordenadasCentro.lat}
                lng={proyecto.coordenadasCentro.lng}
                nombre={proyecto.nombre}
                direccion={proyecto.ubicacion}
              />
            )}
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
          <FichaTecnicaLote
            lote={selectedLote}
            onClose={() => setSelectedLote(null)}
            modoVendedor={modoVendedor}
            coordenadasCentro={proyecto?.coordenadasCentro}
            nombreProyecto={proyecto?.nombre}
            ubicacionProyecto={proyecto?.ubicacion}
          />
        </Suspense>
      )}

      <PWAInstallPrompt />
      <CookieBanner />

      <footer className="border-t border-border mt-12 py-6 text-center">
        <p className="typo-label-md text-muted-foreground">
          &copy; {new Date().getFullYear()} — Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}
