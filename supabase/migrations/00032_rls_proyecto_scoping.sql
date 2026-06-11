-- ============================================================
-- SHOWROOM LOTIZACIÓN — RLS Project Scoping (Fase 4b)
-- Migration: 00032
-- ============================================================
-- Purpose:
--   Scope vendedor data access by proyecto_id. Currently
--   vendedores can see ALL lotes/transacciones/tours across
--   ALL projects. This migration rewrites RLS policies to
--   enforce project-level tenant isolation.
--
-- Changes:
--   1. New SECURITY DEFINER: get_current_user_proyecto_id()
--   2. Rewrite lotes_select_staff to scope by proyecto_id
--   3. Rewrite transacciones_select_staff to scope via lote join
--   4. Rewrite tours_360_select_staff to scope by proyecto_id
--   5. Insert/update policies: vendedor scoped to their project
--
-- Rollback:
--   DROP POLICY IF EXISTS "lotes_select_staff" ON public.lotes;
--   CREATE POLICY "lotes_select_staff" ON public.lotes FOR SELECT USING (
--     public.get_current_user_role() in ('admin', 'vendedor')
--   );
--   -- (similar for transacciones, tours_360)
--   DROP FUNCTION IF EXISTS public.get_current_user_proyecto_id();
-- ============================================================

-- 1. New SECURITY DEFINER function to get current user's project
CREATE OR REPLACE FUNCTION public.get_current_user_proyecto_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT proyecto_id FROM public.usuarios_rol
  WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_proyecto_id() TO authenticated;

COMMENT ON FUNCTION public.get_current_user_proyecto_id() IS
  'SECURITY DEFINER function to get current user project ID. Used in RLS policies for project-level tenant isolation.';

-- 2. Rewrite lotes SELECT policy: vendedor scoped to their project
DROP POLICY IF EXISTS "lotes_select_all" ON public.lotes;

CREATE POLICY "lotes_select_staff" ON public.lotes FOR SELECT USING (
  public.get_current_user_role() = 'admin'
  OR (
    public.get_current_user_role() = 'vendedor'
    AND proyecto_id = public.get_current_user_proyecto_id()
  )
);

-- 3. Rewrite lotes INSERT policy: vendedor scoped to their project
DROP POLICY IF EXISTS "lotes_insert_admin" ON public.lotes;

CREATE POLICY "lotes_insert_admin" ON public.lotes FOR INSERT WITH CHECK (
  public.get_current_user_role() = 'admin'
  OR (
    public.get_current_user_role() = 'vendedor'
    AND proyecto_id = public.get_current_user_proyecto_id()
  )
);

-- 4. Rewrite lotes UPDATE policy: vendedor scoped to their project
DROP POLICY IF EXISTS "lotes_update_admin" ON public.lotes;

CREATE POLICY "lotes_update_admin" ON public.lotes FOR UPDATE USING (
  public.get_current_user_role() = 'admin'
  OR (
    public.get_current_user_role() = 'vendedor'
    AND proyecto_id = public.get_current_user_proyecto_id()
  )
);

-- 5. Rewrite transacciones SELECT: scope via lote → proyecto_id
DROP POLICY IF EXISTS "transacciones_select_staff" ON public.transacciones;

CREATE POLICY "transacciones_select_staff" ON public.transacciones FOR SELECT USING (
  public.get_current_user_role() = 'admin'
  OR (
    public.get_current_user_role() = 'vendedor'
    AND EXISTS (
      SELECT 1 FROM public.lotes
      WHERE lotes.id = transacciones.lote_id
      AND lotes.proyecto_id = public.get_current_user_proyecto_id()
    )
  )
);

-- 6. Rewrite transacciones INSERT: admin only (unchanged logic, use SECURITY DEFINER)
DROP POLICY IF EXISTS "transacciones_insert_admin" ON public.transacciones;

CREATE POLICY "transacciones_insert_admin" ON public.transacciones FOR INSERT WITH CHECK (
  public.get_current_user_role() = 'admin'
);

-- 7. Rewrite tours_360 SELECT: vendedor scoped to their project
DROP POLICY IF EXISTS "tours_360_select_agency" ON public.tours_360;

CREATE POLICY "tours_360_select_staff" ON public.tours_360 FOR SELECT USING (
  public.get_current_user_role() = 'admin'
  OR (
    public.get_current_user_role() = 'vendedor'
    AND proyecto_id = public.get_current_user_proyecto_id()
  )
);

-- 8. Rewrite tour_pois SELECT: scope via tour → proyecto_id
DROP POLICY IF EXISTS "poi_read_all" ON public.tour_pois;

CREATE POLICY "tour_pois_select_staff" ON public.tour_pois FOR SELECT USING (
  public.get_current_user_role() = 'admin'
  OR (
    public.get_current_user_role() = 'vendedor'
    AND EXISTS (
      SELECT 1 FROM public.tours_360
      WHERE tours_360.id = tour_pois.tour_id
      AND tours_360.proyecto_id = public.get_current_user_proyecto_id()
    )
  )
);