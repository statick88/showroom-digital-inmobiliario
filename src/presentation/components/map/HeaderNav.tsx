"use client";

import { Image } from "next/image";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";

export function HeaderNav() {
  return (
    <div className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="Showroom Digital"
          width={24}
          height={24}
          priority
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