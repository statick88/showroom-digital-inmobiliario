function requireEnv(key: string): string {
  const val = import.meta.env[key];
  if (!val) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return val as string;
}

function getSupabaseKey(): string {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const key = anonKey ?? publishableKey;
  if (!key) {
    throw new Error(
      "Missing required env var: VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)"
    );
  }
  return key as string;
}

export const env = {
  supabaseUrl: requireEnv("VITE_SUPABASE_URL"),
  supabaseKey: getSupabaseKey(),
  masterPlanImageUrl: (() => {
    const url = import.meta.env.VITE_MASTER_PLAN_IMAGE_URL ?? "";
    if (url && !url.startsWith("https://")) {
      console.warn("[env] VITE_MASTER_PLAN_IMAGE_URL debe ser HTTPS");
    }
    return url;
  })(),
  proyectoId: requireEnv("VITE_PROYECTO_ID"),
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "",
  agenciaId: import.meta.env.VITE_AGENCIA_ID ?? "",
} as const;