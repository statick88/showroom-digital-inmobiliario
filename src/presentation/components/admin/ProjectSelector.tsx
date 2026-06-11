"use client";

import { useProjectContext } from "@/presentation/context/ProjectContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export function ProjectSelector() {
  const { selectedProjectId, setSelectedProjectId, projects, isLoading } = useProjectContext();

  if (isLoading) {
    return (
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
    );
  }

  if (projects.length <= 1) {
    return null;
  }

  const selected = projects.find((p) => p.id === selectedProjectId);
  const displayName = selected?.nombre || "Sin nombre";

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Proyecto
      </label>
      <Select
        value={selectedProjectId ?? ""}
        onValueChange={(v) => setSelectedProjectId(v || null)}
      >
        <SelectTrigger className="w-[220px]" aria-label="Seleccionar proyecto">
          {/* Render the name directly inside the trigger as fallback */}
          <span className="flex flex-1 text-left truncate">{displayName}</span>
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.nombre || "Sin nombre"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}