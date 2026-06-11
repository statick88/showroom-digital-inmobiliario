export function VirtualTourSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`${className} relative w-full aspect-video max-h-96 bg-muted rounded-xl overflow-hidden animate-pulse`}
      role="status"
      aria-label="Cargando tour 360°"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-muted via-muted/50 to-muted" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm font-medium">Cargando tour 360°...</p>
          <p className="text-xs mt-1">Preparando vista inmersiva</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted to-transparent" />
    </div>
  );
}