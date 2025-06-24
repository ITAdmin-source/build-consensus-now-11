
import { Category } from '@/integrations/supabase/categories';

export const validateCategoryName = (
  name: string, 
  existingCategories: Category[], 
  editingCategoryId?: string
): string => {
  if (!name.trim()) {
    return 'שם הקטגוריה הוא שדה חובה';
  }
  
  if (name.trim().length < 2) {
    return 'שם הקטגוריה חייב להכיל לפחות 2 תווים';
  }
  
  if (name.trim().length > 50) {
    return 'שם הקטגוריה לא יכול להכיל יותר מ-50 תווים';
  }
  
  const isDuplicate = existingCategories.some(cat => 
    cat.name.toLowerCase() === name.trim().toLowerCase() && 
    cat.category_id !== editingCategoryId
  );
  
  if (isDuplicate) {
    return 'קטגוריה עם השם הזה כבר קיימת';
  }
  
  return '';
};
