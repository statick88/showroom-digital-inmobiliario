-- Migration 00023: Commission tables for Vendedor Dashboard
-- Creates: commission_rules, vendedor_commissions, invoices tables
-- + RLS policies + indexes + default rules

-- Commission rules: admin-editable tiered commission structure
CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_price NUMERIC NOT NULL DEFAULT 0,
  max_price NUMERIC,
  percentage NUMERIC NOT NULL CHECK (percentage > 0 AND percentage <= 10),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendedor commissions: per-sale commission records
CREATE TABLE vendedor_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  sale_price NUMERIC NOT NULL CHECK (sale_price > 0),
  commission_amount NUMERIC NOT NULL,
  rule_applied TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  sunat_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices: SUNAT-compliant invoice records
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID REFERENCES vendedor_commissions(id),
  ruc VARCHAR(11) NOT NULL,
  client_name TEXT,
  amount NUMERIC NOT NULL,
  sunat_response JSONB,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_commission_rules_active ON commission_rules(active);
CREATE INDEX idx_vendedor_commissions_vendedor ON vendedor_commissions(vendedor_id);
CREATE INDEX idx_vendedor_commissions_status ON vendedor_commissions(status);
CREATE INDEX idx_invoices_commission ON invoices(commission_id);
CREATE INDEX idx_invoices_ruc ON invoices(ruc);

-- RLS: vendedores see only their own commissions
ALTER TABLE vendedor_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendedor_own_commissions" ON vendedor_commissions
  FOR ALL USING (vendedor_id = auth.uid());

-- Default commission rules for Peru market
INSERT INTO commission_rules (min_price, max_price, percentage, description, active) VALUES
  (0, 200000, 1.5, 'Base tier: 1.5% for properties up to S/ 200,000', true),
  (200001, 500000, 2.0, 'Mid tier: 2% for properties S/ 200,001 - S/ 500,000', true),
  (500001, NULL, 2.5, 'Premium tier: 2.5% for properties above S/ 500,000', true);
