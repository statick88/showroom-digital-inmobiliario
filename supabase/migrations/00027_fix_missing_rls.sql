-- Migration 00027: Fix missing RLS on tables from 00021-00023

-- 1. LEAD_EVENTS
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_events_select_admin" ON public.lead_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "lead_events_insert_service" ON public.lead_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 2. LEAD_SCORES
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_scores_select_admin" ON public.lead_scores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "lead_scores_upsert_service" ON public.lead_scores
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "lead_scores_update_service" ON public.lead_scores
  FOR UPDATE USING (auth.role() = 'service_role');

-- 3. COMMISSION_RULES
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

-- 4. INVOICES
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

-- 5. VENDEDOR_COMMISSIONS (replace existing policy)
DROP POLICY IF EXISTS "vendedor_own_commissions" ON public.vendedor_commissions;

CREATE POLICY "vendedor_commissions_admin_all" ON public.vendedor_commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "vendedor_commissions_vendedor_own" ON public.vendedor_commissions
  FOR ALL USING (vendedor_id = auth.uid());

CREATE POLICY "vendedor_commissions_insert_service" ON public.vendedor_commissions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');