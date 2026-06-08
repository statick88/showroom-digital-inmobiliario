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

export function HeaderNav({ currentTab, onTabChange }: HeaderNavProps) {
  return (
    <div className="border-b border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist">
          {TABS.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={active}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-150 typo-label-md whitespace-nowrap",
                  active
                    ? "bg-accent text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon name={tab.icon} size={18} filled={active} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
