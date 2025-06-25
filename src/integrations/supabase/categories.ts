
import { supabase } from './client';

export interface Category {
  category_id: string;
  name: string;
}

export interface CategoryWithPollCount extends Category {
  poll_count: number;
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching all categories...');
    
    const { data, error } = await supabase
      .from('polis_poll_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    console.log('Categories fetched:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    throw error;
  }
};

// New function to fetch only categories that have active polls
export const fetchActivePollCategories = async (): Promise<CategoryWithPollCount[]> => {
  try {
    console.log('Fetching categories with active polls...');
    
    const { data, error } = await supabase
      .from('polis_poll_categories')
      .select(`
        category_id,
        name,
        polis_polls!inner(poll_id)
      `)
      .eq('polis_polls.status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching active poll categories:', error);
      throw error;
    }

    console.log('Active poll categories data:', data);

    // Transform the data to include poll count
    const categoriesWithCount: CategoryWithPollCount[] = [];
    const categoryMap = new Map<string, CategoryWithPollCount>();

    data?.forEach(item => {
      const categoryId = item.category_id;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          category_id: categoryId,
          name: item.name,
          poll_count: 0
        });
      }
      const category = categoryMap.get(categoryId)!;
      category.poll_count += 1;
    });

    return Array.from(categoryMap.values());
  } catch (error) {
    console.error('Error in fetchActivePollCategories:', error);
    throw error;
  }
};
