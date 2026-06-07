# Setup de Producción — Showroom Digital Inmobiliario

Ejecutá estos pasos en **Supabase Studio** para dejar la base lista.

## Prerequisito

- Acceso a: https://supabase.com/dashboard/project/ktfmrfhznwqsfziafltr/editor

---

## Paso 1 — Fix RLS en spatial_ref_sys (2 min)

1. En el menú lateral, andá a **SQL Editor**.
2. Hacé clic en **New query**.
3. Pegá el contenido de `supabase/migrations/00018_fix_spatial_ref_sys_rls.sql`:

```sql
alter table public.spatial_ref_sys enable row level security;

drop policy if exists "spatial_ref_sys_select_authenticated" on public.spatial_ref_sys;

create policy "spatial_ref_sys_select_authenticated"
  on public.spatial_ref_sys
  for select
  using (auth.role() in ('authenticated', 'anon'));
```

4. Hacé clic en **Run** (o `Ctrl/Cmd + Enter`).
5. Esperá `Success. No rows returned`.

### Verificación rápida

```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'spatial_ref_sys';
```

Esperado: `spatial_ref_sys | true`

---

## Paso 2 — Seed completo de datos (5 min)

1. En **SQL Editor**, creá otra **New query**.
2. Abrí `supabase/seed/seed.sql` en tu editor local.
3. Copiá **todo el contenido** y pegá en la query.
4. Ejecutá con **Run**.

Deberías ver múltiples `Success. No rows returned`.

### Verificación rápida

```sql
SELECT 'agencias' AS tabla, count(*) AS registros FROM public.agencias
UNION ALL SELECT 'proyectos', count(*) FROM public.proyectos
UNION ALL SELECT 'usuarios_rol', count(*) FROM public.usuarios_rol
UNION ALL SELECT 'lotes', count(*) FROM public.lotes
UNION ALL SELECT 'perfiles', count(*) FROM public.perfiles
UNION ALL SELECT 'propiedades', count(*) FROM public.propiedades
UNION ALL SELECT 'leads', count(*) FROM public.leads
UNION ALL SELECT 'metricas_clicks', count(*) FROM public.metricas_clicks
UNION ALL SELECT 'transacciones', count(*) FROM public.transacciones;
```

Esperado:

| tabla | registros |
|-------|-----------|
| agencias | 3 |
| proyectos | 3 |
| usuarios_rol | 6 |
| lotes | 9 |
| perfiles | 6 |
| propiedades | 8 |
| leads | 5 |
| metricas_clicks | 12 |
| transacciones | 3 |

---

## Paso 3 — Probar RLS localmente (opcional)

Para confirmar que las policies funcionan, ejecutá estas queries con **diferentes contextos de autenticación**:

```sql
-- Como anon (sin auth) — solo ve proyectos y lotes públicos
set local role anon;

-- Debería funcionar (lectura pública)
SELECT count(*) FROM public.proyectos WHERE activo = true;
SELECT count(*) FROM public.lotes WHERE estado = 'disponible';

-- Debería fallar (requiere auth)
INSERT INTO public.leads (propiedad_id, nombre, email, score, estado)
VALUES ('pr1000000-0000-0000-0000-000000000001', 'Test', 'test@test.com', 50, 'nuevo');
```

```sql
-- Como authenticated (con un user válido) — inserta leads
set local role authenticated;

INSERT INTO public.leads (propiedad_id, nombre, email, score, estado)
VALUES ('pr1000000-0000-0000-0000-000000000001', 'Test Auth', 'auth@test.com', 50, 'nuevo')
RETURNING *;

-- Limpia el dato de prueba
DELETE FROM public.leads WHERE email = 'auth@test.com';
```

---

## Paso 4 — Correr tests del proyecto

```bash
cd /Users/statick/dev/ideas/SHOWROOM_DICITAL_INMOBILIARIO
pnpm test          # Vitest (unit + integration)
npx playwright test  # E2E (si Playwright está configurado)
```

---

## Troubleshooting

| Error | Solución |
|-------|----------|
| `relation "public.spatial_ref_sys" does not exist` | Verificar que PostGIS esté habilitado en el proyecto Supabase. |
| `duplicate key value violates unique constraint` | El seed tiene `ON CONFLICT DO UPDATE`, así que no debería fallar. Si lo hace, ejecutá `TRUNCATE` de las tablas antes del seed. |
| `new row violates row level security policy` | Verificar que `auth.uid()` esté disponible (necesitás un user autenticado en Session Viewer). |
| `Failed to run command` | Copiar y pegar manualmente cada bloque SQL en el SQL Editor. |

---

## Archivos relevantes

- `supabase/migrations/00018_fix_spatial_ref_sys_rls.sql`
- `supabase/seed/seed.sql`
- `verify-seed.sh`
