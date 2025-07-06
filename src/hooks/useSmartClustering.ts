
import { useState, useEffect } from 'react';
import { checkClusteringStatus, shouldDebounce } from '@/utils/smartClustering';
import { useManualClustering } from './useManualClustering';
import { toast } from 'sonner';

interface UseSmartClusteringProps {
  pollId: string;
  autoTrigger?: boolean;
}

export const useSmartClustering = ({ pollId, autoTrigger = true }: UseSmartClusteringProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastAutoTrigger, setLastAutoTrigger] = useState<string | null>(null);
  const { triggerClustering, isRunning } = useManualClustering();

  const checkAndTriggerClustering = async (force = false) => {
    if (isChecking || isRunning) return;
    
    // Debounce to prevent rapid triggers
    if (!force && shouldDebounce(pollId)) {
      console.log('Clustering trigger debounced for poll:', pollId);
      return;
    }

    setIsChecking(true);
    
    try {
      const status = await checkClusteringStatus(pollId);
      console.log('Clustering status for poll', pollId, ':', status);
      
      if (status.shouldTrigger) {
        console.log('Auto-triggering clustering for poll:', pollId);
        setLastAutoTrigger(new Date().toISOString());
        
        // Show subtle notification for auto-trigger
        if (!force) {
          toast.info('מעדכן קבצות...', { duration: 2000 });
        }
        
        await triggerClustering(pollId, force);
      }
    } catch (error) {
      console.error('Error in smart clustering check:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-trigger on mount if enabled
  useEffect(() => {
    if (autoTrigger && pollId) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        checkAndTriggerClustering();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [pollId, autoTrigger]);

  return {
    checkAndTriggerClustering,
    isChecking,
    isRunning,
    lastAutoTrigger,
    manualTrigger: (force = true) => checkAndTriggerClustering(force)
  };
};
