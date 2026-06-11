"use client";

import { useProjectContext } from "@/presentation/context/ProjectContext";

export function ProjectSelector() {
  const { selectedProjectId, setSelectedProjectId, projects, isLoading } = useProjectContext();

  if (isLoading) {
    return (
      <div className="h-10 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
    );
  }

  if (projects.length <= 1) {
    return null; // No selector needed for single project
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="project-select" className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        Proyecto:
      </label>
      <select
        id="project-select"
        value={selectedProjectId ?? ""}
        onChange={(e) => setSelectedProjectId(e.target.value || null)}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                   dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}