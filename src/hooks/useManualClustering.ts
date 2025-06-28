import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useManualClustering = () => {
  const [isRunning, setIsRunning] = useState(false);

  const triggerClustering = async (pollId: string, forceRecalculate = false) => {
    if (isRunning) {
      toast.error('קיבוץ כבר רץ, אנא המתן');
      return;
    }

    setIsRunning(true);
    
    try {
      console.log(`Triggering clustering for poll ${pollId} (force: ${forceRecalculate})`);
      
      // Call the database function that will trigger the microservice
      const { error } = await supabase.rpc('trigger_clustering_and_consensus', {
        poll_id_param: pollId
      });

      if (error) {
        console.error('Error triggering clustering:', error);
        toast.error('שגיאה בהפעלת הקיבוץ');
        return;
      }

      toast.success('הקיבוץ הופעל בהצלחה');
      
      // The clustering will happen asynchronously via the microservice
      // The UI will be updated via real-time subscriptions
      
    } catch (error) {
      console.error('Error in manual clustering:', error);
      toast.error('שגיאה בהפעלת הקיבוץ');
    } finally {
      // Keep the loading state for a bit to give user feedback
      setTimeout(() => {
        setIsRunning(false);
      }, 2000);
    }
  };

  return {
    triggerClustering,
    isRunning
  };
};
