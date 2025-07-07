
-- Create the polis_rounds table
CREATE TABLE public.polis_rounds (
  round_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK (publish_status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Enable RLS on rounds table
ALTER TABLE public.polis_rounds ENABLE ROW LEVEL SECURITY;

-- RLS policies for rounds
CREATE POLICY "Anyone can view published rounds" 
ON public.polis_rounds 
FOR SELECT 
USING (publish_status = 'published');

CREATE POLICY "Authenticated users can view all rounds" 
ON public.polis_rounds 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can create rounds" 
ON public.polis_rounds 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'poll_admin')
  )
);

CREATE POLICY "Poll creators and super admins can update rounds" 
ON public.polis_rounds 
FOR UPDATE 
USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete rounds" 
ON public.polis_rounds 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Add round_id to polis_polls table
ALTER TABLE public.polis_polls ADD COLUMN round_id UUID REFERENCES public.polis_rounds(round_id);

-- Create a default round for existing polls
INSERT INTO public.polis_rounds (title, description, start_time, end_time, publish_status, created_by)
VALUES (
  'Default Round',
  'Automatically created round for existing polls',
  '2024-01-01 00:00:00+00',
  '2030-12-31 23:59:59+00',
  'published',
  NULL
);

-- Update existing polls to use the default round
UPDATE public.polis_polls 
SET round_id = (SELECT round_id FROM public.polis_rounds WHERE title = 'Default Round' LIMIT 1)
WHERE round_id IS NULL;

-- Make round_id required after updating existing data
ALTER TABLE public.polis_polls ALTER COLUMN round_id SET NOT NULL;

-- Create function to get round active status
CREATE OR REPLACE FUNCTION public.get_round_active_status(
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_publish_status TEXT
) RETURNS TEXT AS $$
BEGIN
  IF p_publish_status = 'draft' THEN
    RETURN NULL;
  END IF;
  
  IF now() < p_start_time THEN
    RETURN 'pending';
  ELSIF now() >= p_start_time AND now() <= p_end_time THEN
    RETURN 'active';
  ELSE
    RETURN 'completed';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update the vote trigger to check round status
CREATE OR REPLACE FUNCTION public.validate_vote_round_status()
RETURNS TRIGGER AS $$
DECLARE
  round_status TEXT;
BEGIN
  -- Get round status for the poll
  SELECT public.get_round_active_status(r.start_time, r.end_time, r.publish_status)
  INTO round_status
  FROM polis_rounds r
  JOIN polis_polls p ON p.round_id = r.round_id
  WHERE p.poll_id = NEW.poll_id;
  
  -- Only allow voting if round is active
  IF round_status != 'active' THEN
    RAISE EXCEPTION 'Voting is not allowed. Round status: %', COALESCE(round_status, 'inactive');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate votes based on round status
DROP TRIGGER IF EXISTS validate_vote_round_trigger ON polis_votes;
CREATE TRIGGER validate_vote_round_trigger
  BEFORE INSERT ON polis_votes
  FOR EACH ROW
  EXECUTE FUNCTION validate_vote_round_status();
