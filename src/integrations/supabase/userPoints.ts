
import { supabase } from './client';

export interface UserPoints {
  total_points: number;
  votes_count: number;
  last_updated: string;
}

export const getUserPoints = async (): Promise<UserPoints | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get or create session ID for anonymous users (similar to voting logic)
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId && !user) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }

  let query = supabase
    .from('polis_user_points')
    .select('total_points, votes_count, last_updated');

  if (user) {
    query = query.eq('user_id', user.id);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    return null;
  }

  const { data, error } = await query.single();

  if (error) {
    // If no points record exists yet, return default values instead of null
    if (error.code === 'PGRST116') {
      return {
        total_points: 0,
        votes_count: 0,
        last_updated: new Date().toISOString()
      };
    }
    console.error('Error fetching user points:', error);
    return null;
  }

  return data;
};

export const subscribeToPointsUpdates = async (
  callback: (points: UserPoints) => void
) => {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = sessionStorage.getItem('session_id');

  if (!user && !sessionId) return null;

  const channel = supabase
    .channel('user-points-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'polis_user_points',
        filter: user ? `user_id=eq.${user.id}` : `session_id=eq.${sessionId}`
      },
      (payload) => {
        const newData = payload.new as UserPoints;
        callback(newData);
      }
    )
    .subscribe();

  return channel;
};
