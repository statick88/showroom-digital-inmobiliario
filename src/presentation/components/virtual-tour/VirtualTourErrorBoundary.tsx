"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface VirtualTourErrorBoundaryProps {
  children: ReactNode;
  fallbackScene?: string;
  onRetry?: () => void;
  tourId?: string;
}

interface VirtualTourErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class VirtualTourErrorBoundary extends Component<
  VirtualTourErrorBoundaryProps,
  VirtualTourErrorBoundaryState
> {
  constructor(props: VirtualTourErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): VirtualTourErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("VirtualTourErrorBoundary caught error:", error, errorInfo);

    // Log to Supabase in production (optional)
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      // Could send to error tracking service or Supabase tour_errors table
      // await supabase.from("tour_errors").insert({ tour_id: this.props.tourId, error: error.message, stack: error.stack });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative w-full aspect-video max-h-96 bg-muted rounded-xl overflow-hidden flex items-center justify-center">
          {this.props.fallbackScene && (
            <img
              src={this.props.fallbackScene}
              alt="Vista previa del tour"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
          <div className="relative z-10 text-center p-6 max-w-md mx-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No se pudo cargar el tour
            </h3>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || "Ocurrió un error inesperado al cargar la vista 360°."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="gap-2"
                size="lg"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                size="lg"
              >
                Recargar página
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left text-xs text-muted-foreground max-h-40 overflow-auto">
                <summary className="cursor-pointer mb-2">Detalles técnicos</summary>
                <pre className="bg-background p-3 rounded border border-border whitespace-pre-wrap">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}