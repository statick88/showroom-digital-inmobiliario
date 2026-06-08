-- Lead events table for tracking visitor engagement
-- Supports WhatsApp click tracking, property views, time spent, and repeat visits

CREATE TABLE lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'whatsapp_click', 'time_spent', 'repeat_visit')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_events_property ON lead_events(property_id);
CREATE INDEX idx_lead_events_visitor ON lead_events(visitor_id);
CREATE INDEX idx_lead_events_type ON lead_events(event_type);
