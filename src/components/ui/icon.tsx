import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number;
  filled?: boolean;
}

export function Icon({ name, size = 24, filled = false, className, ...props }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined inline-block leading-none select-none", className)}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        fontSize: size,
      }}
      aria-hidden
      {...props}
    >
      {name}
    </span>
  );
}
