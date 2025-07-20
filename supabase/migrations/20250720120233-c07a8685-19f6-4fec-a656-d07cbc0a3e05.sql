
-- Create migration audit table to track all migrations
CREATE TABLE public.polis_migration_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  migration_status TEXT NOT NULL DEFAULT 'started',
  points_migrated INTEGER DEFAULT 0,
  votes_migrated INTEGER DEFAULT 0,
  groups_migrated INTEGER DEFAULT 0,
  insights_generated BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on migration audit table
ALTER TABLE public.polis_migration_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for migration audit
CREATE POLICY "Users can view their own migrations" ON public.polis_migration_audit
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage migrations" ON public.polis_migration_audit
  FOR ALL USING (auth.role() = 'service_role');

-- Create the main migration function
CREATE OR REPLACE FUNCTION migrate_guest_to_user(
  p_session_id TEXT,
  p_user_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_points_migrated INTEGER := 0;
  v_votes_migrated INTEGER := 0;
  v_groups_migrated INTEGER := 0;
  v_audit_id UUID;
  v_existing_points INTEGER := 0;
  v_guest_points INTEGER := 0;
BEGIN
  -- Start audit record
  INSERT INTO polis_migration_audit (session_id, user_id, migration_status)
  VALUES (p_session_id, p_user_id, 'started')
  RETURNING id INTO v_audit_id;

  -- 1. Migrate Points (add guest points to user points)
  BEGIN
    -- Get existing user points
    SELECT COALESCE(total_points, 0) INTO v_existing_points
    FROM polis_user_points 
    WHERE user_id = p_user_id;

    -- Get guest points
    SELECT COALESCE(total_points, 0) INTO v_guest_points
    FROM polis_user_points 
    WHERE session_id = p_session_id;

    IF v_guest_points > 0 THEN
      -- Insert or update user points
      INSERT INTO polis_user_points (user_id, total_points, votes_count)
      VALUES (p_user_id, v_guest_points, 
              (SELECT COALESCE(votes_count, 0) FROM polis_user_points WHERE session_id = p_session_id))
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        total_points = polis_user_points.total_points + v_guest_points,
        votes_count = polis_user_points.votes_count + EXCLUDED.votes_count,
        last_updated = now();

      -- Remove guest points entry
      DELETE FROM polis_user_points WHERE session_id = p_session_id;
      v_points_migrated := v_guest_points;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Points migration failed: %', SQLERRM;
  END;

  -- 2. Migrate Votes (update session_id to user_id, avoid duplicates)
  BEGIN
    -- Update votes where user doesn't already have a vote for that statement
    UPDATE polis_votes 
    SET user_id = p_user_id, session_id = NULL
    WHERE session_id = p_session_id
    AND NOT EXISTS (
      SELECT 1 FROM polis_votes v2 
      WHERE v2.user_id = p_user_id 
      AND v2.statement_id = polis_votes.statement_id
    );
    
    GET DIAGNOSTICS v_votes_migrated = ROW_COUNT;

    -- Clean up any remaining guest votes (duplicates)
    DELETE FROM polis_votes WHERE session_id = p_session_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Votes migration failed: %', SQLERRM;
  END;

  -- 3. Migrate Group Memberships
  BEGIN
    -- Update group memberships to user_id
    UPDATE polis_user_group_membership 
    SET user_id = p_user_id, session_id = NULL
    WHERE session_id = p_session_id
    AND NOT EXISTS (
      SELECT 1 FROM polis_user_group_membership ugm2
      WHERE ugm2.user_id = p_user_id 
      AND ugm2.poll_id = polis_user_group_membership.poll_id
    );
    
    GET DIAGNOSTICS v_groups_migrated = ROW_COUNT;

    -- Clean up remaining guest group memberships
    DELETE FROM polis_user_group_membership WHERE session_id = p_session_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Group membership migration failed: %', SQLERRM;
  END;

  -- 4. Update Participant Vectors
  BEGIN
    UPDATE polis_participant_vectors 
    SET participant_id = p_user_id::text
    WHERE participant_id = p_session_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Participant vectors migration failed: %', SQLERRM;
  END;

  -- Update audit record with success
  UPDATE polis_migration_audit 
  SET 
    migration_status = 'completed',
    points_migrated = v_points_migrated,
    votes_migrated = v_votes_migrated,
    groups_migrated = v_groups_migrated,
    completed_at = now()
  WHERE id = v_audit_id;

  -- Return migration summary
  RETURN json_build_object(
    'success', true,
    'audit_id', v_audit_id,
    'points_migrated', v_points_migrated,
    'votes_migrated', v_votes_migrated,
    'groups_migrated', v_groups_migrated,
    'total_points', v_existing_points + v_points_migrated
  );

EXCEPTION WHEN OTHERS THEN
  -- Update audit record with failure
  UPDATE polis_migration_audit 
  SET 
    migration_status = 'failed',
    error_message = SQLERRM,
    completed_at = now()
  WHERE id = v_audit_id;

  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'audit_id', v_audit_id
  );
END;
$$;

-- Create function to get migration preview
CREATE OR REPLACE FUNCTION get_migration_preview(p_session_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_points INTEGER := 0;
  v_votes INTEGER := 0;
  v_polls INTEGER := 0;
  v_groups INTEGER := 0;
BEGIN
  -- Get guest points
  SELECT COALESCE(total_points, 0) INTO v_points
  FROM polis_user_points 
  WHERE session_id = p_session_id;

  -- Get vote count and unique polls
  SELECT 
    COUNT(*) as votes,
    COUNT(DISTINCT poll_id) as polls
  INTO v_votes, v_polls
  FROM polis_votes 
  WHERE session_id = p_session_id;

  -- Get group memberships
  SELECT COUNT(*) INTO v_groups
  FROM polis_user_group_membership 
  WHERE session_id = p_session_id;

  RETURN json_build_object(
    'points', v_points,
    'votes', v_votes,
    'polls', v_polls,
    'groups', v_groups,
    'has_data', (v_points > 0 OR v_votes > 0 OR v_groups > 0)
  );
END;
$$;
