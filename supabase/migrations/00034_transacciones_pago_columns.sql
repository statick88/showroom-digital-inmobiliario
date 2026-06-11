-- ============================================================
-- SHOWROOM LOTIZACIÓN — Transacciones Payment Columns (Fase 4c)
-- Migration: 00034
-- ============================================================

-- 1. Add payment columns to transacciones
ALTER TABLE public.transacciones
  ADD COLUMN IF NOT EXISTS metodo_pago metodo_pago_type DEFAULT 'transferencia',
  ADD COLUMN IF NOT EXISTS cci VARCHAR(20),
  ADD COLUMN IF NOT EXISTS referencia_externa VARCHAR(100);

-- 2. Update existing rows with default
UPDATE public.transacciones SET metodo_pago = 'transferencia' WHERE metodo_pago IS NULL;

-- 3. Make metodo_pago NOT NULL after backfill
ALTER TABLE public.transacciones ALTER COLUMN metodo_pago SET NOT NULL;