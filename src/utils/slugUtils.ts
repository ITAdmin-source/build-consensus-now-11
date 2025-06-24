
/**
 * Generate a URL-safe slug from text
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0590-\u05FF]+/g, '-') // Include Hebrew characters
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
};

/**
 * Validate if a slug is URL-safe
 */
export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9\u0590-\u05FF-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
};

/**
 * Check if slug is available (client-side basic validation)
 */
export const isSlugFormatValid = (slug: string): { valid: boolean; error?: string } => {
  if (!slug || slug.trim().length === 0) {
    return { valid: false, error: 'Slug is required' };
  }
  
  if (!validateSlug(slug)) {
    return { valid: false, error: 'Slug can only contain letters, numbers, and hyphens' };
  }
  
  if (slug.length > 100) {
    return { valid: false, error: 'Slug must be 100 characters or less' };
  }
  
  return { valid: true };
};
