import { supabase } from './client';

export interface UserLeaderboard {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  votes_count: number;
  rank_position: number;
}

export async function getUserLeaderboard(): Promise<UserLeaderboard[]> {
  const { data, error } = await supabase.rpc('get_user_leaderboard');

  if (error) {
    console.error('Error fetching user leaderboard:', error);
    throw error;
  }

  return data || [];
}