
import { supabase } from './client';
import type { CreatePollData } from './polls/types';

export const createPoll = async (pollData: CreatePollData) => {
  try {
    console.log('Creating poll with data:', pollData);
    
    // First, get or create the category
    let categoryId: string;
    
    const { data: existingCategory } = await supabase
      .from('polis_poll_categories')
      .select('category_id')
      .eq('name', pollData.category)
      .single();
    
    if (existingCategory) {
      categoryId = existingCategory.category_id;
    } else {
      const { data: newCategory, error: categoryError } = await supabase
        .from('polis_poll_categories')
        .insert({ name: pollData.category })
        .select('category_id')
        .single();
      
      if (categoryError) {
        console.error('Error creating category:', categoryError);
        throw categoryError;
      }
      
      categoryId = newCategory.category_id;
    }
    
    // Create the poll
    const { data, error } = await supabase
      .from('polis_polls')
      .insert({
        title: pollData.title,
        topic: pollData.topic,
        description: pollData.description,
        category_id: categoryId,
        slug: pollData.slug,
        end_time: pollData.end_time,
        min_consensus_points_to_win: pollData.min_consensus_points_to_win,
        allow_user_statements: pollData.allow_user_statements,
        auto_approve_statements: pollData.auto_approve_statements,
        min_support_pct: pollData.min_support_pct,
        max_opposition_pct: pollData.max_opposition_pct,
        min_votes_per_group: pollData.min_votes_per_group,
        status: 'active',
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
    
    console.log('Poll created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createPoll:', error);
    throw error;
  }
};
