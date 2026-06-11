import { Icon } from "@/components/ui/icon";

interface LandingFooterProps {
  projectName?: string;
}

export function LandingFooter({ projectName }: LandingFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left — branding */}
        <div className="flex items-center gap-2">
          <Icon name="apartment" size={20} className="text-primary" />
          <span className="typo-label-md text-foreground">
            {projectName ?? "Proyecto Inmobiliario"}
          </span>
        </div>

        {/* Center — links */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#app" className="hover:text-foreground transition-colors">
            Inicio
          </a>
          <span className="text-border">|</span>
          <a href="#privacidad" className="hover:text-foreground transition-colors">
            Privacidad
          </a>
        </div>

        {/* Right — copyright */}
        <p className="typo-label-md text-muted-foreground">
          &copy; {year} — Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
