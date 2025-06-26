
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClusteringJob } from '@/types/poll';
import { toast } from 'sonner';

interface UseClusteringEngineProps {
  pollId: string;
}

interface ClusteringEngineState {
  isRunning: boolean;
  currentJob: ClusteringJob | null;
  error: string | null;
}

export const useClusteringEngine = ({ pollId }: UseClusteringEngineProps) => {
  const [state, setState] = useState<ClusteringEngineState>({
    isRunning: false,
    currentJob: null,
    error: null
  });

  const triggerClustering = useCallback(async (forceRecalculate = false) => {
    try {
      setState(prev => ({ ...prev, isRunning: true, error: null }));
      
      console.log(`Triggering clustering for poll: ${pollId}`);
      
      const { data, error } = await supabase.functions.invoke('clustering-engine', {
        body: {
          poll_id: pollId,
          force_recalculate: forceRecalculate
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast.success(
          data.cached 
            ? 'נעשה שימוש בתוצאות קיימות של הקבצה'
            : `הקבצה הושלמה בהצלחה! נוצרו ${data.groups_created} קבוצות ונמצאו ${data.consensus_points_found} נקודות הסכמה`
        );
        
        // The real-time system will automatically update the UI
        return data;
      } else {
        throw new Error(data.error || 'שגיאה לא ידועה בתהליך הקבצה');
      }
    } catch (error) {
      console.error('Clustering error:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהפעלת אלגוריתם הקבצה';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(`שגיאה בקבצה: ${errorMessage}`);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isRunning: false }));
    }
  }, [pollId]);

  const checkClusteringStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('polis_clustering_jobs')
        .select('*')
        .eq('poll_id', pollId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        throw error;
      }

      if (data) {
        setState(prev => ({ 
          ...prev, 
          currentJob: data,
          isRunning: data.status === 'running' || data.status === 'pending'
        }));
      }

      return data;
    } catch (error) {
      console.error('Error checking clustering status:', error);
      return null;
    }
  }, [pollId]);

  const getClusteringMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('polis_clustering_metrics')
        .select('*')
        .eq('poll_id', pollId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching clustering metrics:', error);
      return [];
    }
  }, [pollId]);

  return {
    ...state,
    triggerClustering,
    checkClusteringStatus,
    getClusteringMetrics
  };
};
