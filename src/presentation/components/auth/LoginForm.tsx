import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import { usuariosRepository } from "@/data/repositories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error("Error de autenticación", {
          description: error.message === "Invalid login credentials"
            ? "Credenciales inválidas. Verifica tu email y contraseña."
            : error.message,
        });
        return;
      }

      // Hydrate the auth store from `usuarios_rol`
      const authUserId = data?.user?.id;
      if (authUserId) {
        const row = await usuariosRepository.getByAuthUserId(authUserId);
        if (row) {
          useAuthStore.getState().setFromUsuariosRol(row, { sessionChecked: true });
        } else {
          useAuthStore.getState().reset();
          toast.error("Sin rol asignado", {
            description: "Tu cuenta no tiene un rol asignado. Contacta al administrador.",
          });
          return;
        }
      }

      toast.success("Bienvenido", {
        description: "Has iniciado sesión correctamente.",
      });
      onSuccess?.();
    } catch {
      toast.error("Error", {
        description: "Intenta de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/#auth`,
      });

      if (error) {
        toast.error("Error", {
          description: error.message,
        });
        return;
      }

      toast.success("Email enviado", {
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });
      setShowResetForm(false);
      setResetEmail("");
    } catch {
      toast.error("Error", {
        description: "Intenta de nuevo más tarde.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Restablecer contraseña</h3>
          <p className="text-sm text-muted-foreground">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="nombre@ejemplo.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setShowResetForm(false)}
          >
            Volver
          </Button>
          <Button type="submit" className="flex-1" disabled={resetLoading}>
            {resetLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Enviar enlace"
            )}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="nombre@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10"
          required
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-10 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowResetForm(true)}
          className="text-sm text-primary hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Iniciar Sesión"
        )}
      </Button>
    </form>
  );
}
