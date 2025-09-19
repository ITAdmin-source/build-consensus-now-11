-- Create KV store table for clustering state persistence
CREATE TABLE IF NOT EXISTS public.polis_kv_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for the KV store
ALTER TABLE public.polis_kv_store ENABLE ROW LEVEL SECURITY;

-- Service role can manage KV store
CREATE POLICY "Service role can manage KV store" 
ON public.polis_kv_store 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Super admins can manage KV store
CREATE POLICY "Super admins can manage KV store" 
ON public.polis_kv_store 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM polis_user_roles 
  WHERE user_id = auth.uid() AND role = 'super_admin'
));