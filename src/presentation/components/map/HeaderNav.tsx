"use client";

import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";

export function HeaderNav() {
  return (
    <div className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <img
          src="/vercel.svg"
          alt="Showroom Digital"
          className="h-6 w-6"
        />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Showroom Digital
        </h1>
      </div>
      <Button variant="outline" size="icon">
        <LockIcon className="size-4" />
        <span className="ml-1 hidden sm:inline">Admin</span>
      </Button>
    </div>
  );
}