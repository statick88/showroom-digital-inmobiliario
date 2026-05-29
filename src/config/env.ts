function requireEnv(key: string): string {
  const val = import.meta.env[key];
  if (!val) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return val as string;
}

export const env = {
  supabaseUrl: requireEnv("VITE_SUPABASE_URL"),
  supabaseKey: requireEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
  masterPlanImageUrl: (() => {
    const url = import.meta.env.VITE_MASTER_PLAN_IMAGE_URL ?? "";
    if (url && !url.startsWith("https://")) {
      console.warn("[env] VITE_MASTER_PLAN_IMAGE_URL debe ser HTTPS");
    }
    return url;
  })(),
  agenciaId: requireEnv("VITE_AGENCIA_ID"),
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "",
} as const;
