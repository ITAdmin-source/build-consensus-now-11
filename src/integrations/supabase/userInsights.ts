import { supabase } from './client';

export interface UserInsight {
  insight_id: string;
  poll_id: string;
  poll_title: string;
  poll_description: string | null;
  insight_content: string;
  generated_at: string;
  poll_slug: string | null;
  poll_status: 'draft' | 'active' | 'closed';
}

export async function getUserInsights(): Promise<UserInsight[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('get_user_insights', {
    user_id_param: user.id
  });

  if (error) {
    console.error('Error fetching user insights:', error);
    throw error;
  }

  return data || [];
}

export async function saveUserInsight(
  pollId: string,
  pollTitle: string,
  pollDescription: string | null,
  insightContent: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('polis_user_insights')
    .insert({
      user_id: user.id,
      poll_id: pollId,
      poll_title: pollTitle,
      poll_description: pollDescription,
      insight_content: insightContent
    });

  if (error) {
    console.error('Error saving user insight:', error);
    throw error;
  }
}

export async function deleteUserInsight(insightId: string): Promise<void> {
  const { error } = await supabase
    .from('polis_user_insights')
    .delete()
    .eq('insight_id', insightId);

  if (error) {
    console.error('Error deleting user insight:', error);
    throw error;
  }
}