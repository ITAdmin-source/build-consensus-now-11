
import { supabase } from '@/integrations/supabase/client';

export interface ClusteringStatus {
  isStale: boolean;
  lastClusteredAt: string | null;
  lastVoteAt: string | null;
  shouldTrigger: boolean;
}

export const checkClusteringStatus = async (pollId: string): Promise<ClusteringStatus> => {
  try {
    // Get the poll's last clustering info
    const { data: poll } = await supabase
      .from('polis_polls')
      .select('last_clustered_at, clustering_status')
      .eq('poll_id', pollId)
      .single();

    if (!poll) {
      return {
        isStale: true,
        lastClusteredAt: null,
        lastVoteAt: null,
        shouldTrigger: true
      };
    }

    // Get the most recent vote timestamp
    const { data: lastVote } = await supabase
      .from('polis_votes')
      .select('voted_at')
      .eq('poll_id', pollId)
      .order('voted_at', { ascending: false })
      .limit(1)
      .single();

    const lastClusteredAt = poll.last_clustered_at;
    const lastVoteAt = lastVote?.voted_at || null;

    // Clustering is stale if:
    // 1. Never been clustered, OR
    // 2. There are votes newer than the last clustering, OR  
    // 3. Clustering failed last time
    const isStale = !lastClusteredAt || 
      (lastVoteAt && new Date(lastVoteAt) > new Date(lastClusteredAt)) ||
      poll.clustering_status === 'failed';

    // Only trigger if stale AND not currently running
    const shouldTrigger = isStale && poll.clustering_status !== 'running';

    return {
      isStale,
      lastClusteredAt,
      lastVoteAt,
      shouldTrigger
    };
  } catch (error) {
    console.error('Error checking clustering status:', error);
    return {
      isStale: true,
      lastClusteredAt: null,
      lastVoteAt: null,
      shouldTrigger: true
    };
  }
};

// Debounce utility to prevent multiple rapid triggers
const triggerTimestamps = new Map<string, number>();
const DEBOUNCE_MS = 10000; // 10 seconds

export const shouldDebounce = (pollId: string): boolean => {
  const now = Date.now();
  const lastTrigger = triggerTimestamps.get(pollId) || 0;
  
  if (now - lastTrigger < DEBOUNCE_MS) {
    return true; // Should debounce
  }
  
  triggerTimestamps.set(pollId, now);
  return false; // Can proceed
};
