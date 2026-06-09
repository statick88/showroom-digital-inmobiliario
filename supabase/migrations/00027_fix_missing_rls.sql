-- Migration 00027: Fix missing RLS on tables from 00021-00023
-- These tables were created without Row Level Security, making them publicly accessible

-- 1. LEAD_EVENTS - Track visitor engagement (view, whatsapp_click, time_spent, repeat_visit)
-- Only admins can read all; system can insert via edge functions
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- Admins can read all lead events
CREATE POLICY "lead_events_select_admin" ON public.lead_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

-- Service role (edge functions) can insert lead events
CREATE POLICY "lead_events_insert_service" ON public.lead_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 2. LEAD_SCORES - Computed engagement scores per visitor
-- Only admins can read; system computes/updates via RPC
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_scores_select_admin" ON public.lead_scores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "lead_scores_upsert_service" ON public.lead_scores
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "lead_scores_update_service" ON public.lead_scores
  FOR UPDATE USING (auth.role() = 'service_role');

-- 3. COMMISSION_RULES - Admin-editable commission tier structure
-- Admins can CRUD; vendedores can read active rules
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commission_rules_admin_all" ON public.commission_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "commission_rules_vendedor_read" ON public.commission_rules
  FOR SELECT USING (
    active = true
    AND EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'vendedor')
  );

-- 4. INVOICES - SUNAT-compliant invoice records
-- Linked to vendedor_commissions; same access pattern
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_admin_all" ON public.invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "invoices_vendedor_own" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vendedor_commissions vc
      WHERE vc.id = invoices.commission_id
      AND vc.vendedor_id = auth.uid()
    )
  );

CREATE POLICY "invoices_insert_service" ON public.invoices
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 5. VENDEDOR_COMMISSIONS - Already has RLS (from 00023), but ensure it's complete
-- The existing policy only covers vendedor_id = auth.uid() for ALL operations
-- Need separate policies for admin access
DROP POLICY IF EXISTS "vendedor_own_commissions" ON public.vendedor_commissions;

CREATE POLICY "vendedor_commissions_admin_all" ON public.vendedor_commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "vendedor_commissions_vendedor_own" ON public.vendedor_commissions
  FOR ALL USING (vendedor_id = auth.uid());

CREATE POLICY "vendedor_commissions_insert_service" ON public.vendedor_commissions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');