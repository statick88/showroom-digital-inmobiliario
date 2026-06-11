import { useState, useCallback, useEffect, useRef } from "react";
import { Menu, X, MapPin, Building2, Shield, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import { AuthButtons } from "@/presentation/components/auth/AuthButtons";
import { UserDropdown } from "@/presentation/components/auth/UserDropdown";
import { DarkModeToggle } from "@/presentation/components/shared/DarkModeToggle";

export type Route = "showroom" | "app" | "admin" | "vendedor" | "privacidad" | "auth";

interface NavbarProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  isAuthenticated?: boolean;
  proyectoNombre?: string;
  /** When true, show user dropdown instead of login/register buttons */
  showUserMenu?: boolean;
}

interface NavItem {
  id: Route;
  label: string;
  icon: React.ReactNode;
  showAlways?: boolean;
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "showroom", label: "Showroom", icon: <MapPin className="size-4" />, showAlways: true },
  { id: "app", label: "Proyecto", icon: <Building2 className="size-4" />, showAlways: true },
  { id: "admin", label: "Admin", icon: <Shield className="size-4" />, requiresAuth: true },
];

export function Navbar({
  currentRoute,
  onNavigate,
  isAuthenticated = false,
  proyectoNombre,
  showUserMenu = false,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get auth state from store if not provided via props
  const storeRol = useAuthStore((s) => s.rol);
  const storeNombre = useAuthStore((s) => s.nombre);
  const effectiveIsAuthenticated = showUserMenu || isAuthenticated;

  const handleNavigate = useCallback(
    (route: Route) => {
      onNavigate(route);
      setMobileOpen(false);
    },
    [onNavigate],
  );

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.showAlways || (item.requiresAuth && isAuthenticated),
  );

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <button
            onClick={() => handleNavigate("showroom")}
            className="flex items-center gap-2.5 group"
            aria-label="Ir al inicio"
          >
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Home className="size-4" />
            </div>
            <span className="typo-headline-md text-primary font-bold hidden sm:block">
              {proyectoNombre || "Showroom"}
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1" role="tablist">
            {visibleItems.map((item) => {
              const active = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 typo-label-md",
                    active
                      ? "bg-accent text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Auth section: User dropdown or login/register buttons */}
          <div className="hidden md:flex items-center gap-2">
            <DarkModeToggle />
            {effectiveIsAuthenticated ? (
              <UserDropdown />
            ) : (
              <AuthButtons onNavigate={handleNavigate} />
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center size-10 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="md:hidden border-t border-border bg-card/95 backdrop-blur-lg animate-in slide-in-from-top-2 duration-150"
        >
          <div className="px-4 py-3 space-y-1">
            {visibleItems.map((item) => {
              const active = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-150 typo-label-md text-left",
                    active
                      ? "bg-accent text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Mobile auth section */}
            <div className="pt-2 border-t border-border mt-2">
              {effectiveIsAuthenticated ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <UserDropdown />
                </div>
              ) : (
                <AuthButtons onNavigate={handleNavigate} />
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
