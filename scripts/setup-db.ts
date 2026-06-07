import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!; // opcional

const supabase = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : createClient(SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });

async function exec(label: string, query: string) {
  console.log(`\n→ ${label}`);
  const { error } = await supabase.rpc('exec_sql', { query });
  if (error) {
    console.error(`   ❌ ${error.message}`);
    return false;
  }
  console.log('   ✅ OK');
  return true;
}

async function run() {
  console.log('=== Setup DB — Showroom Digital Inmobiliario ===');

  const rls = `
alter table public.spatial_ref_sys enable row level security;
drop policy if exists "spatial_ref_sys_select_authenticated" on public.spatial_ref_sys;
create policy "spatial_ref_sys_select_authenticated"
  on public.spatial_ref_sys
  for select
  using (auth.role() in ('authenticated','anon'));
`;
  const rlsOk = await exec('RLS spatial_ref_sys', rls);

  console.log('\nNota: el seed.sql requiere ejecución manual (SQL Editor) o la función exec_sql en Supabase.');
  console.log('Si no tenés exec_sql, abrí el SQL Editor y ejecutá supabase/seed/seed.sql.');

  process.exit(rlsOk ? 0 : 1);
}

run();
