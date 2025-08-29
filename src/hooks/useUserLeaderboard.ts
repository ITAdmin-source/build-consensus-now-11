import { useState, useEffect } from 'react';
import { getUserLeaderboard, UserLeaderboard } from '@/integrations/supabase/userLeaderboard';

export const useUserLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<UserLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('שגיאה בטעינת לוח המובילים');
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const refetch = async () => {
    try {
      setError(null);
      const data = await getUserLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error refetching leaderboard:', err);
      setError('שגיאה בטעינת לוח המובילים');
    }
  };

  return { leaderboard, loading, error, refetch };
};