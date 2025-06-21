
-- Create enum types only if they don't exist
DO $$ BEGIN
    CREATE TYPE polis_poll_status AS ENUM ('draft', 'active', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE polis_vote_value AS ENUM ('support', 'oppose', 'unsure');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE polis_content_type AS ENUM ('text', 'image', 'audio', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user profiles table for storing additional user data (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin roles table (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_admin_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role polis_admin_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll categories table (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_poll_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- Create main polls table (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_polls (
  poll_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  topic TEXT,
  description TEXT,
  category_id UUID REFERENCES polis_poll_categories(category_id),
  end_time TIMESTAMP WITH TIME ZONE,
  min_consensus_points_to_win INTEGER DEFAULT 3,
  allow_user_statements BOOLEAN DEFAULT true,
  auto_approve_statements BOOLEAN DEFAULT false,
  status polis_poll_status DEFAULT 'draft',
  min_support_pct FLOAT DEFAULT 50,
  max_opposition_pct FLOAT DEFAULT 50,
  min_votes_per_group INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create statements table (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_statements (
  statement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  content_type polis_content_type DEFAULT 'text',
  content TEXT NOT NULL,
  created_by_user_id UUID REFERENCES auth.users(id),
  is_user_suggested BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create votes table (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_votes (
  vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  statement_id UUID REFERENCES polis_statements(statement_id) ON DELETE CASCADE,
  vote_value polis_vote_value NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create groups table for clustering (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_groups (
  group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  algorithm TEXT DEFAULT 'k-means',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user group membership table (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_user_group_membership (
  user_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES polis_groups(group_id) ON DELETE CASCADE,
  poll_id UUID REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, poll_id)
);

-- Create consensus points table (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_consensus_points (
  statement_id UUID REFERENCES polis_statements(statement_id) ON DELETE CASCADE,
  poll_id UUID REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (statement_id, poll_id)
);

-- Create poll admins table (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_poll_admins (
  user_id UUID REFERENCES auth.users(id),
  poll_id UUID REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, poll_id)
);

-- Create group statement stats table (only if not exists)
CREATE TABLE IF NOT EXISTS public.polis_group_statement_stats (
  group_id UUID REFERENCES polis_groups(group_id) ON DELETE CASCADE,
  statement_id UUID REFERENCES polis_statements(statement_id) ON DELETE CASCADE,
  poll_id UUID REFERENCES polis_polls(poll_id) ON DELETE CASCADE,
  support_pct FLOAT,
  oppose_pct FLOAT,
  total_votes INTEGER,
  PRIMARY KEY (group_id, statement_id)
);

-- Enable Row Level Security on all tables (safe to run multiple times)
ALTER TABLE public.polis_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_poll_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_user_group_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_consensus_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_poll_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polis_group_statement_stats ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user registration (replace if exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.polis_admin_profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create RLS policies (drop if exists first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.polis_admin_profiles;
CREATE POLICY "Users can view their own profile" ON public.polis_admin_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view active polls" ON public.polis_polls;
CREATE POLICY "Anyone can view active polls" ON public.polis_polls
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Anyone can view approved statements" ON public.polis_statements;
CREATE POLICY "Anyone can view approved statements" ON public.polis_statements
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users can view their own votes" ON public.polis_votes;
CREATE POLICY "Users can view their own votes" ON public.polis_votes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own votes" ON public.polis_votes;
CREATE POLICY "Users can insert their own votes" ON public.polis_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default poll category if it doesn't exist
INSERT INTO public.polis_poll_categories (name) 
SELECT 'כללי'
WHERE NOT EXISTS (SELECT 1 FROM public.polis_poll_categories WHERE name = 'כללי');
