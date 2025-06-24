
-- Add slug column to polis_polls table
ALTER TABLE polis_polls ADD COLUMN slug TEXT;

-- Add unique constraint on slug
ALTER TABLE polis_polls ADD CONSTRAINT unique_poll_slug UNIQUE (slug);

-- Create function to generate URL-safe slugs from text
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to ensure unique slug
CREATE OR REPLACE FUNCTION ensure_unique_slug(base_slug TEXT, exclude_poll_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-generate slug from title
CREATE OR REPLACE FUNCTION auto_generate_poll_slug()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slugs
CREATE TRIGGER trigger_auto_generate_poll_slug
  BEFORE INSERT OR UPDATE ON polis_polls
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_poll_slug();

-- Generate slugs for existing polls
UPDATE polis_polls 
SET slug = ensure_unique_slug(generate_slug(title), poll_id)
WHERE slug IS NULL OR slug = '';
