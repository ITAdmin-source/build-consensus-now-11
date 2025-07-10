import { useState, useEffect, useCallback } from 'react';
import { getUserPoints, subscribeToPointsUpdates, UserPoints } from '@/integrations/supabase/userPoints';
import { useAuth } from '@/contexts/AuthContext';

export const useUserPoints = () => {
  const [points, setPoints] = useState<UserPoints>({
    total_points: 0,
    votes_count: 0,
    last_updated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPoints = useCallback(async () => {
    try {
      setLoading(true);
      const userPoints = await getUserPoints();
      setPoints(userPoints);
    } catch (error) {
      console.error('Error fetching user points:', error);
      // Keep default points structure on error
    } finally {
      setLoading(false);
    }
  }, []);

  const incrementPoints = useCallback(() => {
    setPoints(prev => ({
      ...prev,
      total_points: prev.total_points + 1,
      votes_count: prev.votes_count + 1,
      last_updated: new Date().toISOString()
    }));
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  useEffect(() => {
    let channel: any = null;
    
    const setupSubscription = async () => {
      channel = await subscribeToPointsUpdates((updatedPoints) => {
        setPoints(updatedPoints);
      });
    };

    setupSubscription();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user]);

  return {
    points,
    loading,
    incrementPoints,
    refetch: fetchPoints
  };
};
