"use client";

/**
 * `<RoleGuard>` — role-gated wrapper for routes (T-4.2).
 *
 * Renders children if the current user's role matches `rol` (or is
 * `admin`, which passes every guard). When the user is unauthenticated
 * or has the wrong role, the guard:
 *
 *   1. Shows a toast — "Acceso restringido" for wrong-role, "Debes
 *      iniciar sesion" for unauthenticated.
 *   2. Redirects to `#showroom`.
 *   3. Does NOT render the children.
 *
 * While the auth store is still hydrating (i.e. `sessionChecked: false`
 * at first paint), the guard renders nothing and shows no toast. This
 * avoids a flash of the redirect-toast on every page reload.
 *
 * Usage in App.tsx:
 *   <RoleGuard rol="vendedor">
 *     <VendedorPanel />
 *   </RoleGuard>
 */

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuthStore, type Rol } from "@/presentation/hooks/useAuthStore";

interface RoleGuardProps {
  /** The role required to view the children. Admins always pass. */
  rol: Rol;
  children: React.ReactNode;
}

export function RoleGuard({ rol, children }: RoleGuardProps) {
  const { rol: currentRol, sessionChecked } = useAuthStore();
  const redirected = useRef(false);

  const isAdmin = currentRol === "admin";
  const isMatch = currentRol === rol;
  const allowed = isAdmin || isMatch;

  useEffect(() => {
    if (!sessionChecked) return;
    if (allowed) return;
    if (redirected.current) return;
    redirected.current = true;

    if (currentRol === null) {
      toast.error("Debes iniciar sesion", {
        description: "Inicia sesion para acceder a esta seccion.",
      });
    } else {
      toast.error("Acceso restringido", {
        description: "Tu rol no tiene permiso para acceder a esta seccion.",
      });
    }

    window.location.hash = "#showroom";
  }, [sessionChecked, allowed, currentRol]);

  if (!sessionChecked) return null;
  if (!allowed) return null;
  return <>{children}</>;
}
