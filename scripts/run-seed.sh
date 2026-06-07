#!/usr/bin/env bash
# Ejecuta el seed Node que crea usuarios en Auth y luego inserta datos de negocio.
# Requiere Node y @supabase/supabase-js en el proyecto.
# Uso:
#   bash scripts/run-seed.sh
# O directo:
#   npx tsx scripts/seed.ts

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_SQL="$SCRIPT_DIR/../supabase/seed/seed.sql"

if [[ ! -f "$SEED_SQL" ]]; then
  echo "❌ No se encontró $SEED_SQL"
  exit 1
fi

if [[ ! -f ".env.local" ]]; then
  echo "❌ Faltan variables de entorno en .env.local"
  exit 1
fi

echo "🚀 Ejecutando seed de producción..."
node --import 'data:text/javascript,process.env.SUPPRESS_NO_ANSI=1' "$SCRIPT_DIR/seed.js" "$SEED_SQL"
