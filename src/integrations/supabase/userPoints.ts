
import { supabase } from './client';

export interface UserPoints {
  total_points: number;
  votes_count: number;
  last_updated: string;
}

const getOrCreateSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const getUserPoints = async (): Promise<UserPoints> => {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = getOrCreateSessionId();

  let query = supabase
    .from('polis_user_points')
    .select('total_points, votes_count, last_updated');

  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    query = query.eq('session_id', sessionId);
  }

  const { data, error } = await query.single();

  if (error) {
    // Return default points structure for new users/sessions
    return {
      total_points: 0,
      votes_count: 0,
      last_updated: new Date().toISOString()
    };
  }

  return data;
};

export const subscribeToPointsUpdates = async (
  callback: (points: UserPoints) => void
) => {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = getOrCreateSessionId();

  if (!user && !sessionId) return null;

  const channel = supabase
    .channel('user-points-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'polis_user_points',
        filter: user ? `user_id=eq.${user.id}` : `session_id=eq.${sessionId}`
      },
      (payload) => {
        console.log('Points update received:', payload);
        const newData = payload.new as UserPoints;
        if (newData) {
          callback(newData);
        }
      }
    )
    .subscribe((status) => {
      console.log('Points subscription status:', status);
    });

  return channel;
};
