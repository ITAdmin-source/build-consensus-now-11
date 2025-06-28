
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useManualClustering = () => {
  const [isRunning, setIsRunning] = useState(false);

  const triggerClustering = async (pollId: string, forceRecalculate: boolean = true) => {
    setIsRunning(true);
    
    try {
      console.log(`Manually triggering clustering for poll: ${pollId}`);
      
      const { data, error } = await supabase.functions.invoke('clustering-engine', {
        body: {
          poll_id: pollId,
          force_recalculate: forceRecalculate
        }
      });

      if (error) {
        console.error('Clustering error:', error);
        throw error;
      }

      if (data.success) {
        const message = data.cached 
          ? 'נעשה שימוש בתוצאות קיימות של הקבצה'
          : `הקבצה הושלמה בהצלחה! נוצרו ${data.groups_created} קבוצות ונמצאו ${data.consensus_points_found} נקודות הסכמה`;
        
        toast.success(message);
        
        // Log debug information
        if (data.debug) {
          console.log('Clustering debug info:', data.debug);
        }
        
        return data;
      } else {
        throw new Error(data.error || 'שגיאה בתהליך הקבצה');
      }
    } catch (error) {
      console.error('Manual clustering error:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהפעלת אלגוריתם הקבצה';
      toast.error(`שגיאה בקבצה: ${errorMessage}`);
      throw error;
    } finally {
      setIsRunning(false);
    }
  };

  return {
    triggerClustering,
    isRunning
  };
};
