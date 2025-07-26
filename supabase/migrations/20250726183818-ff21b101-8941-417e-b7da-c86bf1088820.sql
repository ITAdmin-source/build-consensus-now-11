-- Fix function search path security issues by adding SET search_path TO 'public'

-- Fix auto_generate_poll_slug function
CREATE OR REPLACE FUNCTION public.auto_generate_poll_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only generate slug if it's not provided or is empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := ensure_unique_slug(generate_slug(NEW.title), NEW.poll_id);
  ELSE
    -- Ensure provided slug is unique
    NEW.slug := ensure_unique_slug(NEW.slug, NEW.poll_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix calculate_consensus_points function
CREATE OR REPLACE FUNCTION public.calculate_consensus_points(poll_id_param uuid, cluster_profiles_param jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE
  cluster_profile JSONB;
  statement_profile JSONB;
  statement_idx INTEGER;
  total_agree INTEGER;
  total_disagree INTEGER;
  total_votes INTEGER;
  agree_percent NUMERIC;
  disagree_percent NUMERIC;
  is_consensus BOOLEAN;
  consensus_settings RECORD;
BEGIN
  -- Get consensus settings
  SELECT 
    consensus_min_agree_percent,
    consensus_max_disagree_percent
  INTO consensus_settings
  FROM polis_game_settings
  LIMIT 1;

  -- If no settings found, use defaults
  IF consensus_settings IS NULL THEN
    consensus_settings.consensus_min_agree_percent := 50;
    consensus_settings.consensus_max_disagree_percent := 50;
  END IF;

  -- Loop through each statement to check consensus
  FOR statement_idx IN 
    SELECT DISTINCT statement_index 
    FROM polis_statements 
    WHERE poll_id = poll_id_param
  LOOP
    total_agree := 0;
    total_disagree := 0;
    total_votes := 0;
    is_consensus := true;

    -- Check each cluster's stance on this statement
    FOR cluster_profile IN SELECT jsonb_array_elements(cluster_profiles_param)
    LOOP
      SELECT sp INTO statement_profile
      FROM jsonb_array_elements(cluster_profile->'statementProfiles') sp
      WHERE (sp->>'statementIndex')::integer = statement_idx;

      IF statement_profile IS NOT NULL THEN
        DECLARE
          cluster_agree INTEGER := (statement_profile->>'agreeCount')::integer;
          cluster_disagree INTEGER := (statement_profile->>'disagreeCount')::integer;
          cluster_total INTEGER := cluster_agree + cluster_disagree + (statement_profile->>'passCount')::integer;
          cluster_agree_percent NUMERIC;
          cluster_disagree_percent NUMERIC;
        BEGIN
          IF cluster_total > 0 THEN
            cluster_agree_percent := (cluster_agree::numeric / cluster_total) * 100;
            cluster_disagree_percent := (cluster_disagree::numeric / cluster_total) * 100;
            
            -- Check if this cluster meets consensus criteria
            IF cluster_agree_percent < consensus_settings.consensus_min_agree_percent OR 
               cluster_disagree_percent > consensus_settings.consensus_max_disagree_percent THEN
              is_consensus := false;
            END IF;
            
            total_agree := total_agree + cluster_agree;
            total_disagree := total_disagree + cluster_disagree;
            total_votes := total_votes + cluster_total;
          ELSE
            is_consensus := false;
          END IF;
        END;
      ELSE
        is_consensus := false;
      END IF;
    END LOOP;

    -- Calculate overall percentages
    IF total_votes > 0 THEN
      agree_percent := (total_agree::numeric / total_votes) * 100;
      disagree_percent := (total_disagree::numeric / total_votes) * 100;
    ELSE
      agree_percent := 0;
      disagree_percent := 0;
      is_consensus := false;
    END IF;

    -- Update statement consensus status
    UPDATE polis_statements 
    SET 
      is_consensus_point = is_consensus,
      consensus_metadata = CASE 
        WHEN is_consensus THEN 
          JSONB_BUILD_OBJECT(
            'agreePercent', agree_percent,
            'disagreePercent', disagree_percent,
            'totalVoters', total_votes,
            'isConsensus', is_consensus
          )
        ELSE NULL
      END,
      consensus_achieved_at = CASE 
        WHEN is_consensus AND NOT COALESCE(is_consensus_point, false) THEN now()
        WHEN NOT is_consensus THEN NULL
        ELSE consensus_achieved_at
      END
    WHERE poll_id = poll_id_param AND statement_index = statement_idx;
  END LOOP;

  -- Update poll game status based on consensus points
  DECLARE
    consensus_count INTEGER;
    participant_count INTEGER;
    game_settings RECORD;
  BEGIN
    -- Count current consensus points
    SELECT COUNT(*) INTO consensus_count
    FROM polis_statements
    WHERE poll_id = poll_id_param AND is_consensus_point = true;

    -- Get participant count
    SELECT COUNT(DISTINCT session_id) INTO participant_count
    FROM polis_votes
    WHERE poll_id = poll_id_param;

    -- Get game settings for this poll
    SELECT 
      COALESCE(p.game_min_participants, gs.default_min_participants) as min_participants,
      COALESCE(p.game_min_consensus_points, gs.default_min_consensus_points) as min_consensus_points
    INTO game_settings
    FROM polis_polls p
    CROSS JOIN polis_game_settings gs
    WHERE p.id = poll_id_param
    LIMIT 1;

    -- Update game status
    UPDATE polis_polls
    SET game_status = CASE
      WHEN participant_count < game_settings.min_participants THEN 'pending'
      WHEN consensus_count >= game_settings.min_consensus_points THEN 'won'
      ELSE 'active'
    END
    WHERE id = poll_id_param;
  END;
END;$function$;

-- Fix ensure_unique_slug function
CREATE OR REPLACE FUNCTION public.ensure_unique_slug(base_slug text, exclude_poll_id uuid DEFAULT NULL::uuid)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  final_slug TEXT;
  counter INTEGER := 1;
  slug_exists BOOLEAN;
BEGIN
  final_slug := base_slug;
  
  -- Check if slug exists (excluding current poll if updating)
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM polis_polls 
      WHERE slug = final_slug 
      AND (exclude_poll_id IS NULL OR polis_polls.poll_id != exclude_poll_id)
    ) INTO slug_exists;
    
    EXIT WHEN NOT slug_exists;
    
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- Fix generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  slug_text TEXT;
BEGIN
  -- Convert to lowercase and replace spaces with hyphens
  slug_text := LOWER(TRIM(input_text));
  
  -- Replace Hebrew and special characters with hyphens
  slug_text := REGEXP_REPLACE(slug_text, '[^a-z0-9]+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  slug_text := TRIM(BOTH '-' FROM slug_text);
  
  -- Limit length to 100 characters
  slug_text := SUBSTRING(slug_text FROM 1 FOR 100);
  
  RETURN slug_text;
END;
$function$;

-- Fix update_polis_cluster_cache_updated_at function
CREATE OR REPLACE FUNCTION public.update_polis_cluster_cache_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;