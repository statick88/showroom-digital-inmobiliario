"use client";

import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import type { Route } from "@/presentation/components/shared/Navbar";

interface AuthButtonsProps {
  onNavigate: (route: Route) => void;
}

export function AuthButtons({ onNavigate }: AuthButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate("auth")}
        className="hidden sm:flex"
      >
        <LogIn className="size-4 mr-1.5" />
        Iniciar Sesión
      </Button>
      <Button
        size="sm"
        onClick={() => onNavigate("auth")}
        className="hidden sm:flex"
      >
        <UserPlus className="size-4 mr-1.5" />
        Registrarse
      </Button>

      {/* Mobile: just icons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate("auth")}
        className="sm:hidden"
        aria-label="Iniciar sesión"
      >
        <LogIn className="size-4" />
      </Button>
    </div>
  );
}
