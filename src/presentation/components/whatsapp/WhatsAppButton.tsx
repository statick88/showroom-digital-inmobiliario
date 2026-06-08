import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhatsApp } from "@/presentation/hooks/useWhatsApp";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  propertyName: string;
  price: number;
  vendedorPhone: string;
  propertyId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 gap-1 px-2 text-xs",
  md: "h-9 gap-1.5 px-3 text-sm",
  lg: "h-10 gap-2 px-4 text-base",
};

export function WhatsAppButton({
  propertyName,
  price,
  vendedorPhone,
  propertyId,
  size = "md",
  className,
}: WhatsAppButtonProps) {
  const { openWhatsApp, isTracking } = useWhatsApp(propertyName, price, vendedorPhone, propertyId);

  if (!vendedorPhone) return null;

  return (
    <Button
      variant="default"
      size={size === "sm" ? "xs" : size === "lg" ? "lg" : "default"}
      className={cn(
        "bg-[#25D366] text-white hover:bg-[#1da851] hover:shadow-card-hover hover:-translate-y-0.5",
        sizeClasses[size],
        className,
      )}
      onClick={openWhatsApp}
      disabled={isTracking}
      aria-label="Contactar por WhatsApp"
    >
      {isTracking ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <MessageCircle className="size-4" />
      )}
      <span>WhatsApp</span>
    </Button>
  );
}
