export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  masterPlanImageUrl: process.env.NEXT_PUBLIC_MASTER_PLAN_IMAGE_URL ?? "",
} as const;
