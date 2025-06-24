
-- Create polis_system_settings table to store system-wide settings
CREATE TABLE public.polis_system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default minimum statements setting
INSERT INTO public.polis_system_settings (setting_key, setting_value, setting_type, description)
VALUES ('min_statements_per_poll', '6', 'integer', 'מספר ההצהרות המינימלי הנדרש ליצירת סקר חדש');

-- Enable RLS for system settings (only admins should modify)
ALTER TABLE public.polis_system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for system settings - only super admins can read/write
CREATE POLICY "Only super admins can manage system settings" 
ON public.polis_system_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM polis_user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_polis_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_polis_system_settings_updated_at
  BEFORE UPDATE ON public.polis_system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_polis_system_settings_updated_at();

-- Add a function to get poll count per category
CREATE OR REPLACE FUNCTION get_category_poll_count(category_id_param UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM polis_polls
  WHERE category_id = category_id_param;
$$;
