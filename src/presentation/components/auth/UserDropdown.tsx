import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Shield, ShoppingBag } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
  comprador: "Comprador",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield className="size-3" />,
  vendedor: <User className="size-3" />,
  comprador: <ShoppingBag className="size-3" />,
};

export function UserDropdown() {
  const { email, nombre, rol, reset } = useAuthStore();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      reset();
      window.location.hash = "#showroom";
      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión correctamente.",
      });
    } catch {
      toast.error("Error", {
        description: "No se pudo cerrar la sesión. Intenta de nuevo.",
      });
    }
  };

  // Get initials from name or email
  const getInitials = (): string => {
    if (nombre) {
      return nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors outline-none">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-foreground leading-none">
            {nombre || email}
          </span>
          {rol && (
            <span className="text-xs text-muted-foreground leading-none mt-1">
              {ROLE_LABELS[rol] || rol}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">{nombre || "Usuario"}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>

        <DropdownMenuSeparator />

        {rol && (
          <DropdownMenuItem disabled className="flex items-center gap-2 text-muted-foreground">
            {ROLE_ICONS[rol]}
            <span>{ROLE_LABELS[rol] || rol}</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-destructive cursor-pointer"
        >
          <LogOut className="size-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
