#!/usr/bin/env bash
# =============================================================================
# verify-seed.sh — Verifica RLS, seed y conectividad de Supabase
# Uso: bash verify-seed.sh
# =============================================================================
set -euo pipefail

SUPABASE_PROJECT="${SUPABASE_PROJECT:-ktfmrfhznwqsfziafltr}"
SUPABASE_URL="https://${SUPABASE_PROJECT}.supabase.co"
PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-sb_publishable_NuFYPz4bOng1acagbAPrMQ_AqQPzV91}"

echo "============================================================"
echo " VERIFICACIÓN DE SEED Y RLS — Showroom Digital Inmobiliario"
echo "============================================================"

if ! command -v supabase &>/dev/null; then
  echo "⚠️  Supabase CLI no encontrado. Se usará supabase-js para verificar."
  echo "   Instalá 'supabase' CLI para operaciones avanzadas:"
  echo "   brew install supabase/tap/supabase"
fi

# =============================================================================
# 1. Verificar RLS en spatial_ref_sys
# =============================================================================
echo ""
echo "─── 1. RLS en spatial_ref_sys ───────────────────────────────"

if command -v supabase &>/dev/null; then
  echo "🔗 Proyecto: ${SUPABASE_URL}"
  echo "📋 Migraciones a aplicar: supabase db push --project-ref ${SUPABASE_PROJECT} --yes"
  
  # Intentar aplicar migraciones
  supabase db push \
    --project-ref "${SUPABASE_PROJECT}" \
    --yes 2>/dev/null || echo "❌ No se pudo aplicar migraciones automáticamente. Aplicá la migración 00018 manualmente desde Supabase Studio."
else
  echo "⚠️  Aplicá la migración 00018 manualmente:"
  echo "   SQL Editor → supabase/migrations/00018_fix_spatial_ref_sys_rls.sql → Run"
fi

# =============================================================================
# 2. Verificar seed
# =============================================================================
echo ""
echo "─── 2. Seed de datos ────────────────────────────────────────"

SEED_FILE="/Users/statick/dev/ideas/SHOWROOM_DICITAL_INMOBILIARIO/supabase/seed/seed.sql"
if [[ -f "$SEED_FILE" ]]; then
  echo "✅ Seed file encontrado: ${SEED_FILE}"
  echo "   Tamaño: $(wc -l < "$SEED_FILE") líneas"
  echo ""
  echo "   📋 Tablas cubiertas:"
  grep -E "^\s+public\.\w+" "$SEED_FILE" | grep -oP "public\.\w+" | sort -u | while read -r tbl; do
    echo "     - $tbl"
  done
else
  echo "❌ Seed file NO encontrado: ${SEED_FILE}"
fi

# =============================================================================
# 3. Resumen de qué debe estar en la base
# =============================================================================
echo ""
echo "─── 3. Datos esperados (después de ejecutar seed.sql) ────────"

declare -A EXPECTED=(
  ["agencias"]=3
  ["proyectos"]=3
  ["usuarios_rol"]=6
  ["lotes"]=9
  ["perfiles"]=6
  ["propiedades"]=8
  ["leads"]=5
  ["metricas_clicks"]=12
  ["transacciones"]=3
)

echo "   📊 Cantidades esperadas por tabla:"
for table in "${!EXPECTED[@]}"; do
  echo "     - $table: ${EXPECTED[$table]} registros"
done

# =============================================================================
# 4. Queries de sanity check (para ejecutar manualmente)
# =============================================================================
echo ""
echo "─── 4. Queries de verificación (ejecutar en Supabase Studio) ──"
echo ""
echo "   -- RLS status"
echo "   SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('spatial_ref_sys', 'agencias', 'propiedades', 'lotes', 'leads');"
echo ""
echo "   -- Conteos de tablas"
for table in "${!EXPECTED[@]}"; do
  echo "   SELECT '${table}' AS tabla, count(*) AS registros FROM public.${table};"
done

# =============================================================================
# 5. Verificar env.local
# =============================================================================
echo ""
echo "─── 5. Variables de entorno ─────────────────────────────────"
ENV_FILE="/Users/statick/dev/ideas/SHOWROOM_DICITAL_INMOBILIARIO/.env.local"
if [[ -f "$ENV_FILE" ]]; then
  echo "✅ .env.local existe"
  grep -E "^(VITE_SUPABASE_URL|VITE_SUPABASE_PUBLISHABLE_KEY|VITE_AGENCIA_ID)=" "$ENV_FILE" | sed 's/=/=***REDACTED***/' || true
else
  echo "❌ .env.local NO encontrado"
fi

# =============================================================================
# 6. Verificar estructura de fuentes
# =============================================================================
echo ""
echo "─── 6. Archivos de código relevantes ───────────────────────"
SRC_LIB="/Users/statick/dev/ideas/SHOWROOM_DICITAL_INMOBILIARIO/src/lib"
[[ -f "$SRC_LIB/supabase/client.ts" ]] && echo "✅ src/lib/supabase/client.ts" || echo "❌ client.ts faltante"
[[ -f "$SRC_LIB/env.ts" ]] && echo "✅ src/lib/env.ts" || echo "ℹ️  env.ts no requerido"
[[ -d "$SRC_LIB/schemas" ]] && echo "✅ src/lib/schemas/ (incluye tests)" || echo "❌ schemas/ faltante"

# =============================================================================
# Fin
# =============================================================================
echo ""
echo "============================================================"
echo " ✅ Verificación completada"
echo "============================================================"
echo ""
echo "Acciones pendientes (si corresponde):"
echo "  1. Aplicar migración 00018 desde Supabase Studio"
echo "  2. Ejecutar seed.sql desde SQL Editor"
echo "  3. Correr queries de sanity check"
echo "  4. Correr tests: pnpm test"
echo ""
