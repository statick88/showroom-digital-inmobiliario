-- ============================================================
-- SHOWROOM LOTIZACIÓN — Pagos Table (Fase 4c)
-- Migration: 00033
-- ============================================================

-- 1. Create payment method enum
DO $$ BEGIN
  CREATE TYPE metodo_pago_type AS ENUM (
    'yape', 'plin', 'transferencia', 'bcp', 'interbank', 'bbva', 'scotiabank', 'efectivo'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create pagos table
CREATE TABLE IF NOT EXISTS public.pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaccion_id UUID NOT NULL REFERENCES public.transacciones(id) ON DELETE CASCADE,
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  metodo_pago metodo_pago_type NOT NULL DEFAULT 'transferencia',
  cci VARCHAR(20),
  referencia_externa VARCHAR(100),
  fecha_pago TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX idx_pagos_transaccion ON public.pagos(transaccion_id);

-- 4. RLS
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagos_select_staff" ON public.pagos FOR SELECT USING (
  public.get_current_user_role() IN ('admin', 'vendedor')
);

CREATE POLICY "pagos_insert_admin" ON public.pagos FOR INSERT WITH CHECK (
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "pagos_update_admin" ON public.pagos FOR UPDATE USING (
  public.get_current_user_role() = 'admin'
);

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at_pagos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_pagos
  BEFORE UPDATE ON public.pagos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_pagos();

-- 6. Comments
COMMENT ON TABLE public.pagos IS 'Payment records linked to transactions. Tracks partial payments with method, amount, and reference.';
COMMENT ON COLUMN public.pagos.transaccion_id IS 'FK to transacciones.id — the transaction this payment belongs to';
COMMENT ON COLUMN public.pagos.metodo_pago IS 'Payment method: yape, plin, transferencia, bank name, or efectivo';
COMMENT ON COLUMN public.pagos.referencia_externa IS 'External reference: MP payment ID, transfer reference, etc.';