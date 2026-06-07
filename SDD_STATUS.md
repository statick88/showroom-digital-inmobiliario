# Estado del SDD y setup de producción

## SDD — Cumplimiento

| Capa | Estado |
|------|--------|
| `openspec/config.yaml` | ✅ |
| `DESIGN.md` | ✅ |
| Specs (10 specs) | ✅ |
| Migraciones (00001–00018) | ✅ |
| RLS en tablas de negocio | ✅ (migraciones previas) |
| `spatial_ref_sys` RLS | ⚠️ migración `00018` lista, requiere ejecución manual una sola vez |
| `.env.local` | ✅ (URL + publishable key) |
| `seed.sql` | ✅ datos completos regenerados |

## Seed generado — resumen

| Tabla | Registros |
|-------|-----------|
| `agencias` | 3 |
| `proyectos` | 3 |
| `usuarios_rol` | 6 (1 admin, 2 vendedores, 3 compradores) |
| `lotes` | 9 (disponible / reservado / vendido) |
| `perfiles` | 6 |
| `propiedades` | 8 |
| `leads` | 5 |
| `metricas_clicks` | 12 eventos |
| `transacciones` | 3 (2 ventas + 1 reserva) |

IDs fijos predecibles, idempotente (`ON CONFLICT DO UPDATE`), cubre legacy + lotización.

## Pendiente para producción

1. **Aplicar migración 00018** — abrir https://supabase.com/dashboard/project/ktfmrfhznwqsfziafltr/editor, pegar el contenido de `supabase/migrations/00018_fix_spatial_ref_sys_rls.sql` y ejecutarlo.
2. **Ejecutar seed** — en el mismo SQL Editor, pegar el contenido de `supabase/seed/seed.sql` y ejecutarlo.
3. **Verificar** con las queries y cantidades indicadas más arriba.

Eso elimina el warning y carga todos los datos de prueba listos para producción.
