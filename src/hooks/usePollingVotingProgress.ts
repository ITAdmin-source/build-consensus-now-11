
import { useState, useEffect } from 'react';
import { getUserVotingProgress, UserVotingProgress } from '@/integrations/supabase/userVotingProgress';

export const usePollingVotingProgress = (pollIds: string[]) => {
  const [progressData, setProgressData] = useState<Record<string, UserVotingProgress>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProgressForPolls = async () => {
      if (pollIds.length === 0) return;

      // Set loading state for all polls
      const loadingState = pollIds.reduce((acc, pollId) => {
        acc[pollId] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setLoading(loadingState);

      // Fetch progress for each poll
      const progressPromises = pollIds.map(async (pollId) => {
        try {
          const progress = await getUserVotingProgress(pollId);
          return { pollId, progress };
        } catch (error) {
          console.error(`Error fetching progress for poll ${pollId}:`, error);
          return {
            pollId,
            progress: {
              votedCount: 0,
              totalCount: 0,
              completionPercentage: 0,
              isComplete: false,
              isStarted: false,
            } as UserVotingProgress
          };
        }
      });

      const results = await Promise.all(progressPromises);
      
      // Update state with results
      const newProgressData: Record<string, UserVotingProgress> = {};
      const newLoadingState: Record<string, boolean> = {};
      
      results.forEach(({ pollId, progress }) => {
        newProgressData[pollId] = progress;
        newLoadingState[pollId] = false;
      });

      setProgressData(prev => ({ ...prev, ...newProgressData }));
      setLoading(prev => ({ ...prev, ...newLoadingState }));
    };

    fetchProgressForPolls();
  }, [pollIds.join(',')]); // Re-run when poll IDs change

  return { progressData, loading };
};
