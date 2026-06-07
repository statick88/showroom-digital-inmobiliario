import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./globals.css";
import "./config/glass.css";

async function cleanupLegacyServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  if (registrations.length === 0) return;

  await Promise.all(registrations.map((registration) => registration.unregister()));

  if (navigator.serviceWorker.controller) {
    window.location.reload();
  }
}

void cleanupLegacyServiceWorkers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
