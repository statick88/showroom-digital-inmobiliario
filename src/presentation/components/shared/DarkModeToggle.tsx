"use client";

import { useState, useEffect, useCallback } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "theme-preference";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) return stored;
  } catch {
    // localStorage not available
  }
  return "system";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className }: DarkModeToggleProps) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);

    // Listen for system theme changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const cycle = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage not available
    }
    applyTheme(next);
  }, [theme]);

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className={cn("size-9 rounded-lg flex items-center justify-center text-muted-foreground", className)}
        aria-label="Cargar tema"
        disabled
      >
        <Monitor className="size-4" />
      </button>
    );
  }

  const icon = theme === "light" ? (
    <Sun className="size-4" />
  ) : theme === "dark" ? (
    <Moon className="size-4" />
  ) : (
    <Monitor className="size-4" />
  );

  const label = theme === "light" ? "Tema claro" : theme === "dark" ? "Tema oscuro" : "Tema del sistema";

  return (
    <button
      onClick={cycle}
      className={cn(
        "size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        className,
      )}
      aria-label={`${label}. Cambiar tema`}
      title={label}
    >
      {icon}
    </button>
  );
}
