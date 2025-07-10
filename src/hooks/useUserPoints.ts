
import { useState, useEffect, useCallback } from 'react';
import { getUserPoints, subscribeToPointsUpdates, UserPoints } from '@/integrations/supabase/userPoints';
import { useAuth } from '@/contexts/AuthContext';

export const useUserPoints = () => {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPoints = useCallback(async () => {
    try {
      setLoading(true);
      const userPoints = await getUserPoints();
      setPoints(userPoints);
    } catch (error) {
      console.error('Error fetching user points:', error);
      setPoints(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const incrementPoints = useCallback(() => {
    setPoints(prev => {
      if (!prev) return { total_points: 1, votes_count: 1, last_updated: new Date().toISOString() };
      return {
        ...prev,
        total_points: prev.total_points + 1,
        votes_count: prev.votes_count + 1,
        last_updated: new Date().toISOString()
      };
    });
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints, user]);

  useEffect(() => {
    const setupSubscription = async () => {
      const channel = await subscribeToPointsUpdates((updatedPoints) => {
        setPoints(updatedPoints);
      });

      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    };

    setupSubscription();
  }, [user]);

  return {
    points,
    loading,
    incrementPoints,
    refetch: fetchPoints
  };
};
