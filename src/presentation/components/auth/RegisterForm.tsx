import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    if (!nombre.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error("Error", { description: "Todos los campos son obligatorios." });
      return false;
    }

    if (password.length < 6) {
      toast.error("Error", { description: "La contraseña debe tener al menos 6 caracteres." });
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Error", { description: "Las contraseñas no coinciden." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombre: nombre.trim(),
          },
        },
      });

      if (authError) {
        toast.error("Error de registro", {
          description: authError.message === "User already registered"
            ? "Este email ya está registrado. Intenta iniciar sesión."
            : authError.message,
        });
        return;
      }

      if (!authData.user) {
        toast.error("Error", {
          description: "No se pudo crear la cuenta. Intenta de nuevo.",
        });
        return;
      }

      // 2. Create usuarios_rol row with comprador role
      const { error: roleError } = await supabase.from("usuarios_rol").insert({
        auth_user_id: authData.user.id,
        email: email.trim(),
        nombre: nombre.trim(),
        rol: "comprador",
      });

      if (roleError) {
        console.error("Error creating user role:", roleError);
        // Account was created but role assignment failed
        toast.warning("Cuenta creada", {
          description: "Tu cuenta fue creada pero necesitas contacto al administrador para asignar tu rol.",
        });
        onSuccess?.();
        return;
      }

      // 3. Auto-login after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        toast.success("Cuenta creada", {
          description: "Tu cuenta fue creada. Ahora puedes iniciar sesión.",
        });
        onSuccess?.();
        return;
      }

      toast.success("Bienvenido", {
        description: "Tu cuenta ha sido creada exitosamente.",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tu nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="pl-10"
          required
        />
      </div>

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

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="pl-10 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Registrarse"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Al registrarte, aceptas nuestros{" "}
        <button
          type="button"
          onClick={() => (window.location.hash = "#privacidad")}
          className="text-primary hover:underline"
        >
          Términos y Privacidad
        </button>
      </p>
    </form>
  );
}
