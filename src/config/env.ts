function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return val;
}

export const env = {
  supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseKey: requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  masterPlanImageUrl: process.env.NEXT_PUBLIC_MASTER_PLAN_IMAGE_URL ?? "",
  agenciaId: process.env.NEXT_PUBLIC_AGENCIA_ID ?? "a0000000-0000-0000-0000-000000000001",
} as const;
