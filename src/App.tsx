import { useState, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { MapView } from "@/presentation/components/map/MapView";
import { AdminDashboard } from "@/presentation/components/admin/AdminDashboard";

type Route = "map" | "admin";

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  const [sessionChecked, setSessionChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session);
      setSessionChecked(true);
    });
  }, []);

  const hash = window.location.hash.replace("#", "") as Route;
  const route: Route = hash === "admin" ? "admin" : "map";

  useEffect(() => {
    if (sessionChecked && route === "admin" && !authenticated && !redirected.current) {
      redirected.current = true;
      window.location.hash = "#map";
      toast.error("Acceso restringido", {
        description: "Debes iniciar sesión para acceder al panel de administración.",
      });
    }
  }, [sessionChecked, route, authenticated]);

  const effectiveRoute: Route =
    sessionChecked && route === "admin" && !authenticated ? "map" : route;

  return (
    <QueryClientProvider client={queryClient}>
      {effectiveRoute === "map" ? <MapView /> : <AdminDashboard />}
      <Toaster />
    </QueryClientProvider>
  );
}
