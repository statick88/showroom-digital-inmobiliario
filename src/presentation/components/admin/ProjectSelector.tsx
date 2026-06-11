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
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-medium text-muted-foreground">
        Proyecto
      </label>
      <Select
        value={selectedProjectId ?? ""}
        onValueChange={(v) => setSelectedProjectId(v || null)}
      >
        <SelectTrigger className="w-full" aria-label="Seleccionar proyecto">
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