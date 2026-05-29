"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function AdminLogin({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error("Error de autenticación", {
          description: error.message,
        });
      } else {
        onLogin?.();
      }
    } catch {
      toast.error("Error", {
        description: "Intenta de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="font-headline-md text-headline-md font-bold text-primary mb-1">
            Showroom Inmobiliario
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 login-card-shadow border border-outline-variant/30">
          <header className="mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface text-center">
              Acceso Administrativo
            </h2>
            <p className="font-label-md text-label-md text-on-surface-variant text-center mt-1">
              Ingrese sus credenciales para gestionar el catálogo
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4" id="loginForm">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant/60"
                  viewBox="0 0 24 24"
                >
                  <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <input
                  className="w-full h-12 pl-12 pr-4 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring transition-all"
                  id="email"
                  name="email"
                  placeholder="nombre@inmobiliaria.pe"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant/60"
                  viewBox="0 0 24 24"
                >
                  <path fill="currentColor" d="M18 1H6c-1.1 0-2 .9-2 2v18l4-4h12c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z" />
                </svg>
                <input
                  className="w-full h-12 pl-12 pr-12 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d={showPassword ? "M12 4.5c-7 0-11 7-11 7s3 5 7 7 4-2.3 7-4.6 11-7 0-7-4-7-7-7zm0 12.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" : "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.93 2.93c1.51-1.26 2.35-3.13 2.35-5.22 0-3.99-3.01-7-7-7-.99 0-1.95.21-2.82.58l1.76 1.76c.57-.23 1.18-.36 1.82-.36zm-4.95 3.71c-.26-.84-.39-1.72-.39-2.62 0-3.99 3.01-7 7-7 1.71 0 3.57.71 4.95 2.11-.41.79-1.29 1.65-2.3 2.45-1.03.8-2.27 1.29-3.54 1.31l-4.15-4.15c-.8.54-1.5.95-2.11 1.21zM3.51 3.51a10 10 0 0 1 14.13 0l-1.41 1.41A8 8 0 1 0 4.93 6.93L3.51 5.51z"
                    }
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => {}}
              className="w-full h-12 bg-primary text-on-primary font-bold rounded-full shadow-md hover:bg-primary-container active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <span>{loading ? "Validando..." : "Ingresar"}</span>
              <svg className="size-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2l3 3-3 3-1-1-3-3H8v8h8V9l-1-1z" />
              </svg>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-outline-variant/30 text-center">
            <p className="font-label-md text-label-md text-on-surface-variant">Solo personal autorizado</p>
          </div>
        </div>
      </div>
    </div>
  );
}