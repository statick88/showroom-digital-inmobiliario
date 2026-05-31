"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type TabView = "inicio" | "ubicacion" | "lotizacion" | "financiamiento";

interface HeaderNavProps {
  currentTab: TabView;
  onTabChange: (tab: TabView) => void;
  proyectoNombre?: string;
}

const TABS: { id: TabView; label: string; icon: string }[] = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "ubicacion", label: "Ubicación", icon: "location_on" },
  { id: "lotizacion", label: "Lotización", icon: "layers" },
  { id: "financiamiento", label: "Financiamiento", icon: "payments" },
];

export function HeaderNav({ currentTab, onTabChange, proyectoNombre }: HeaderNavProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {proyectoNombre && (
              <h1 className="typo-headline-md text-primary hidden sm:block">{proyectoNombre}</h1>
            )}
          </div>
          <nav className="flex gap-1 sm:gap-2" role="tablist">
            {TABS.map((tab) => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 typo-label-md",
                    "min-h-[48px] min-w-[48px]",
                    active
                      ? "bg-accent text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon name={tab.icon} size={22} filled={active} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
