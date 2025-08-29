import { supabase } from './client';

export interface UserPollParticipation {
  poll_id: string;
  poll_title: string;
  poll_slug: string;
  poll_status: 'draft' | 'active' | 'closed';
  vote_count: number;
  first_vote_at: string;
  last_vote_at: string;
  total_statements: number;
  is_completed: boolean;
}

export async function getUserPollParticipation(): Promise<UserPollParticipation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('get_user_poll_participation', {
    user_id_param: user.id
  });

  if (error) {
    console.error('Error fetching user poll participation:', error);
    throw error;
  }

  return data || [];
}