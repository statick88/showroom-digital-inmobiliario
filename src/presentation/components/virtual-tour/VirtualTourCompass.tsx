import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VirtualTourCompassProps {
  heading: number; // degrees, 0-360
  visible: boolean;
  className?: string;
}

export function VirtualTourCompass({
  heading,
  visible,
  className = "",
}: VirtualTourCompassProps) {
  const [normalizedHeading, setNormalizedHeading] = useState(() => ((heading % 360) + 360) % 360);

  /* eslint-disable */
  useEffect(() => {
    // Normalize heading to 0-360 using functional update
    setNormalizedHeading((prev) => {
      const next = ((heading % 360) + 360) % 360;
      return prev === next ? prev : next;
    });
  }, [heading]);
  /* eslint-enable */

  if (!visible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`${className} absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none`}
        role="img"
        aria-label={`Brújula: ${Math.round(normalizedHeading)}°`}
        aria-hidden={!visible}
      >
        <div className="relative w-24 h-24">
          {/* Compass rose background */}
          <div className="absolute inset-0 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-transparent to-primary/10" />
          </div>

          {/* Rotating compass needle */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-12 origin-center"
            style={{
              transformOrigin: "center bottom",
              background: "linear-gradient(to bottom, var(--primary), transparent)",
              borderRadius: "2px",
            }}
            animate={{ rotate: -normalizedHeading }}
            transition={{ duration: 0.1, ease: "linear" }}
          />

          {/* Cardinal directions */}
          {["N", "E", "S", "O"].map((dir, i) => (
            <div
              key={dir}
              className="absolute text-xs font-medium text-muted-foreground pointer-events-none"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-72px) rotate(${-i * 90}deg)`,
              }}
            >
              {dir}
            </div>
          ))}

          {/* Degree markers */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              className="absolute w-0.5 h-2 bg-border/50 pointer-events-none"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-60px)`,
                transformOrigin: "center bottom",
              }}
            />
          ))}
        </div>

        {/* Heading display */}
        <motion.div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-mono text-foreground border border-border shadow-md">
            {Math.round(normalizedHeading)}°
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}