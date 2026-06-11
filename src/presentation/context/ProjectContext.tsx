"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";

interface Proyecto {
  id: string;
  nombre: string;
  activo: boolean;
}

interface ProjectContextType {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projects: Proyecto[];
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase
        .from("proyectos")
        .select("id, nombre, activo")
        .eq("activo", true)
        .order("nombre");

      if (data) {
        setProjects(data);
        // Default to first project if none selected
        if (!selectedProjectId && data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      }
      setIsLoading(false);
    }
    fetchProjects();
  }, [selectedProjectId]);

  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId, projects, isLoading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}