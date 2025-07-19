import { useState, useEffect } from 'react';
import { getUserInsights, UserInsight } from '@/integrations/supabase/userInsights';
import { useAuth } from '@/contexts/AuthContext';

export const useUserInsights = () => {
  const [insights, setInsights] = useState<UserInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInsights = async () => {
      if (!user) {
        setInsights([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getUserInsights();
        setInsights(data);
      } catch (err) {
        console.error('Error fetching user insights:', err);
        setError('שגיאה בטעינת התובנות האישיות');
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [user]);

  const refetch = async () => {
    if (user) {
      try {
        setError(null);
        const data = await getUserInsights();
        setInsights(data);
      } catch (err) {
        console.error('Error refetching user insights:', err);
        setError('שגיאה בטעינת התובנות האישיות');
      }
    }
  };

  return { insights, loading, error, refetch };
};