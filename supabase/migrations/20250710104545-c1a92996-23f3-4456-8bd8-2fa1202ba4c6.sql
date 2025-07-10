
-- Create user_points table for cross-poll point tracking
CREATE TABLE public.polis_user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  votes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_points_user_or_session_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  ),
  CONSTRAINT unique_user_points UNIQUE (user_id),
  CONSTRAINT unique_session_points UNIQUE (session_id)
);

-- Enable RLS
ALTER TABLE public.polis_user_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own points" ON public.polis_user_points
  FOR SELECT USING (
    user_id = auth.uid() OR 
    session_id = current_setting('request.headers.x-session-id', true)
  );

CREATE POLICY "Service role can manage all points" ON public.polis_user_points
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update user points after vote
CREATE OR REPLACE FUNCTION update_user_points_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Update points for logged-in user
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO polis_user_points (user_id, total_points, votes_count)
    VALUES (NEW.user_id, 1, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_points = polis_user_points.total_points + 1,
      votes_count = polis_user_points.votes_count + 1,
      last_updated = now();
  -- Update points for guest user
  ELSIF NEW.session_id IS NOT NULL THEN
    INSERT INTO polis_user_points (session_id, total_points, votes_count)
    VALUES (NEW.session_id, 1, 1)
    ON CONFLICT (session_id) 
    DO UPDATE SET 
      total_points = polis_user_points.total_points + 1,
      votes_count = polis_user_points.votes_count + 1,
      last_updated = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on polis_votes
CREATE TRIGGER trigger_update_user_points
  AFTER INSERT ON polis_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points_on_vote();

-- Add index for performance
CREATE INDEX idx_polis_user_points_user_id ON polis_user_points(user_id);
CREATE INDEX idx_polis_user_points_session_id ON polis_user_points(session_id);
