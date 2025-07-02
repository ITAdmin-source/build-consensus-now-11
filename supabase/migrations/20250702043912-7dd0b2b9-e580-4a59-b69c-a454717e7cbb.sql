
-- Add statement weights table to store calculated routing weights
CREATE TABLE public.polis_statement_weights (
  weight_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  statement_id UUID NOT NULL REFERENCES polis_statements(statement_id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  predictiveness FLOAT NOT NULL DEFAULT 0,
  consensus_potential FLOAT NOT NULL DEFAULT 0,
  recency FLOAT NOT NULL DEFAULT 1,
  pass_rate_penalty FLOAT NOT NULL DEFAULT 1,
  combined_weight FLOAT NOT NULL DEFAULT 1,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  UNIQUE(statement_id, poll_id)
);

-- Add participant vectors table to store opinion profiles
CREATE TABLE public.polis_participant_vectors (
  vector_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL, -- session_id or user_id
  opinion_vector JSONB NOT NULL DEFAULT '[]'::jsonb,
  cluster_affinity JSONB NOT NULL DEFAULT '{}'::jsonb,
  vote_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, participant_id)
);

-- Add indexes for performance
CREATE INDEX idx_polis_statement_weights_poll_expires ON polis_statement_weights(poll_id, expires_at);
CREATE INDEX idx_polis_statement_weights_statement ON polis_statement_weights(statement_id);
CREATE INDEX idx_polis_participant_vectors_poll_participant ON polis_participant_vectors(poll_id, participant_id);
CREATE INDEX idx_polis_participant_vectors_updated ON polis_participant_vectors(poll_id, last_updated);

-- Enable RLS
ALTER TABLE public.polis_statement_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_participant_vectors ENABLE ROW LEVEL SECURITY;

-- RLS policies for statement weights
CREATE POLICY "Anyone can view statement weights for active polls" 
  ON public.polis_statement_weights 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM polis_polls 
    WHERE polis_polls.poll_id = polis_statement_weights.poll_id 
    AND polis_polls.status = 'active'
  ));

CREATE POLICY "Service role and poll creators can manage statement weights" 
  ON public.polis_statement_weights 
  FOR ALL 
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM polis_polls 
      WHERE polis_polls.poll_id = polis_statement_weights.poll_id 
      AND polis_polls.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM polis_user_roles 
      WHERE polis_user_roles.user_id = auth.uid() 
      AND polis_user_roles.role = 'super_admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM polis_polls 
      WHERE polis_polls.poll_id = polis_statement_weights.poll_id 
      AND polis_polls.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM polis_user_roles 
      WHERE polis_user_roles.user_id = auth.uid() 
      AND polis_user_roles.role = 'super_admin'
    )
  );

-- RLS policies for participant vectors
CREATE POLICY "Service role and poll creators can manage participant vectors" 
  ON public.polis_participant_vectors 
  FOR ALL 
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM polis_polls 
      WHERE polis_polls.poll_id = polis_participant_vectors.poll_id 
      AND polis_polls.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM polis_user_roles 
      WHERE polis_user_roles.user_id = auth.uid() 
      AND polis_user_roles.role = 'super_admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM polis_polls 
      WHERE polis_polls.poll_id = polis_participant_vectors.poll_id 
      AND polis_polls.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM polis_user_roles 
      WHERE polis_user_roles.user_id = auth.uid() 
      AND polis_user_roles.role = 'super_admin'
    )
  );

-- Add feature flag for routing system to system settings
INSERT INTO polis_system_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('statement_routing_enabled', 'false', 'boolean', 'Enable Pol.is-style statement routing'),
  ('routing_cache_ttl_minutes', '5', 'integer', 'Cache TTL for statement weights in minutes'),
  ('routing_cold_start_boost', '2.0', 'float', 'Recency boost multiplier for new statements')
ON CONFLICT (setting_key) DO NOTHING;

-- Clean up expired weights function
CREATE OR REPLACE FUNCTION cleanup_expired_statement_weights()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM polis_statement_weights WHERE expires_at < now();
END;
$$;
