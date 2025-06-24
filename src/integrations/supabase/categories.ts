
import { supabase } from "./client";

export interface Category {
  category_id: string;
  name: string;
  polls_count?: number;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('polis_poll_categories')
    .select('category_id, name');
  
  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  // Get poll counts for each category
  const categoriesWithCounts = await Promise.all(
    (data || []).map(async (category) => {
      const { data: pollCount } = await supabase
        .rpc('get_category_poll_count', { category_id_param: category.category_id });
      
      return {
        ...category,
        polls_count: pollCount || 0
      };
    })
  );

  return categoriesWithCounts;
};

export const createCategory = async (name: string): Promise<Category> => {
  const { data, error } = await supabase
    .from('polis_poll_categories')
    .insert({ name })
    .select('category_id, name')
    .single();
  
  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return { ...data, polls_count: 0 };
};

export const updateCategory = async (categoryId: string, name: string): Promise<void> => {
  const { error } = await supabase
    .from('polis_poll_categories')
    .update({ name })
    .eq('category_id', categoryId);
  
  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('polis_poll_categories')
    .delete()
    .eq('category_id', categoryId);
  
  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};
