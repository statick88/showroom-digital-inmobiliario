"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function HeaderNav() {
  return (
    <div className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <h1 className="typo-headline-md text-primary font-bold">Showroom Inmobiliario</h1>
      <Button variant="outline" size="sm" aria-label="Admin">
        <Lock className="size-4" />
        <span className="ml-1 hidden sm:inline">Admin</span>
      </Button>
    </div>
  );
}
