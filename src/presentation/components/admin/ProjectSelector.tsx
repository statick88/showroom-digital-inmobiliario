"use client";

import { useProjectContext } from "@/presentation/context/ProjectContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectSelector() {
  const { selectedProjectId, setSelectedProjectId, projects, isLoading } = useProjectContext();

  if (isLoading) {
    return (
      <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
    );
  }

  if (projects.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Proyecto
      </label>
      <Select
        value={selectedProjectId ?? ""}
        onValueChange={(v) => setSelectedProjectId(v || null)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Seleccionar proyecto" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}