import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "/showroom-digital-inmobiliario/",
  build: {
    outDir: "out",
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: (id) =>
                id.includes("node_modules/react") || id.includes("node_modules/react-dom"),
            },
            {
              name: "leaflet-vendor",
              test: (id) =>
                id.includes("node_modules/leaflet") || id.includes("node_modules/react-leaflet"),
            },
            {
              name: "supabase-vendor",
              test: (id) => id.includes("node_modules/@supabase"),
            },
          ],
        },
      },
    },
  },
});
