import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],
      manifest: {
        name: "Showroom Digital Inmobiliario",
        short_name: "Showroom",
        description: "Explora propiedades inmobiliarias de manera inmersiva",
        theme_color: "#c2785c",
        background_color: "#1a1614",
        display: "standalone",
        icons: [
          {
            src: "/icons/192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
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
