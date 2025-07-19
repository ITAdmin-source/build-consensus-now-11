
-- Create table to store personal insights for users
CREATE TABLE public.polis_user_insights (
  insight_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  poll_id uuid NOT NULL,
  poll_title text NOT NULL,
  poll_description text,
  insight_content text NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.polis_user_insights ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own insights
CREATE POLICY "Users can view their own insights" 
  ON public.polis_user_insights 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own insights
CREATE POLICY "Users can create their own insights" 
  ON public.polis_user_insights 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own insights
CREATE POLICY "Users can update their own insights" 
  ON public.polis_user_insights 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own insights
CREATE POLICY "Users can delete their own insights" 
  ON public.polis_user_insights 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_polis_user_insights_updated_at
  BEFORE UPDATE ON public.polis_user_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_polis_user_insights_user_id ON public.polis_user_insights(user_id);
CREATE INDEX idx_polis_user_insights_poll_id ON public.polis_user_insights(poll_id);

-- Create function to get user insights with poll data
CREATE OR REPLACE FUNCTION get_user_insights(user_id_param uuid)
RETURNS TABLE(
  insight_id uuid,
  poll_id uuid,
  poll_title text,
  poll_description text,
  insight_content text,
  generated_at timestamp with time zone,
  poll_slug text,
  poll_status polis_poll_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ui.insight_id,
    ui.poll_id,
    ui.poll_title,
    ui.poll_description,
    ui.insight_content,
    ui.generated_at,
    p.slug as poll_slug,
    p.status as poll_status
  FROM polis_user_insights ui
  LEFT JOIN polis_polls p ON ui.poll_id = p.poll_id
  WHERE ui.user_id = user_id_param
  ORDER BY ui.generated_at DESC;
END;
$$;
