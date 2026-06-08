-- Lead scores table for AI-powered lead prioritization
-- Stores computed engagement scores (0-100) per visitor

CREATE TABLE lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT UNIQUE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  breakdown JSONB NOT NULL DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_scores_score ON lead_scores(score DESC);

-- RPC function to compute lead score from engagement events
CREATE OR REPLACE FUNCTION compute_lead_score(p_visitor_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_views INTEGER;
  v_clicks INTEGER;
  v_time INTEGER;
  v_repeats INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_views FROM lead_events
    WHERE visitor_id = p_visitor_id AND event_type = 'view';
  SELECT COUNT(*) INTO v_clicks FROM lead_events
    WHERE visitor_id = p_visitor_id AND event_type = 'whatsapp_click';
  SELECT COALESCE(SUM((metadata->>'seconds')::INT), 0) INTO v_time FROM lead_events
    WHERE visitor_id = p_visitor_id AND event_type = 'time_spent';
  SELECT COUNT(*) INTO v_repeats FROM lead_events
    WHERE visitor_id = p_visitor_id AND event_type = 'repeat_visit';

  v_score := LEAST(100,
    (v_views * 10) + (v_clicks * 25) + (LEAST(v_time, 120) / 3) + (v_repeats * 15)
  );
  RETURN GREATEST(10, v_score); -- baseline 10
END;
$$ LANGUAGE plpgsql;
