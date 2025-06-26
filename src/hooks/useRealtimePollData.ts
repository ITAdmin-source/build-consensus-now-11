
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { fetchPollBySlug } from '@/integrations/supabase/polls';
import { fetchStatementsByPollId } from '@/integrations/supabase/statements';
import { fetchGroupsByPollId, fetchGroupStatsByPollId, fetchConsensusPointsByPollId } from '@/integrations/supabase/groups';
import { fetchUserVotes } from '@/integrations/supabase/votes';
import { toast } from 'sonner';

interface UseRealtimePollDataProps {
  slug: string;
}

interface RealtimePollData {
  poll: Poll | null;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
  groups: Group[];
  groupStats: GroupStatementStats[];
  userVotes: Record<string, string>;
  loading: boolean;
  error: string | null;
  isLive: boolean;
}

export const useRealtimePollData = ({ slug }: UseRealtimePollDataProps): RealtimePollData => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [consensusPoints, setConsensusPoints] = useState<ConsensusPoint[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupStats, setGroupStats] = useState<GroupStatementStats[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  
  const channelRef = useRef<any>(null);
  const pollIdRef = useRef<string | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Debounced data refetch to prevent excessive API calls
  const debouncedRefetch = useRef<NodeJS.Timeout | null>(null);

  const refetchPollData = async (pollId: string, skipToast = false) => {
    try {
      // Debounce rapid updates
      const now = Date.now();
      if (now - lastUpdateRef.current < 1000) {
        return;
      }
      lastUpdateRef.current = now;

      const [pollData, statementsData, consensusPointsData, groupsData, groupStatsData, votesData] = await Promise.all([
        fetchPollBySlug(slug),
        fetchStatementsByPollId(pollId),
        fetchConsensusPointsByPollId(pollId),
        fetchGroupsByPollId(pollId),
        fetchGroupStatsByPollId(pollId),
        fetchUserVotes(pollId)
      ]);

      if (pollData) setPoll(pollData);
      setStatements(statementsData);
      setConsensusPoints(consensusPointsData);
      setGroups(groupsData);
      setGroupStats(groupStatsData);
      setUserVotes(votesData);

      if (!skipToast) {
        setIsLive(true);
        setTimeout(() => setIsLive(false), 2000);
      }
    } catch (error) {
      console.error('Error refetching poll data:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const pollData = await fetchPollBySlug(slug);
        if (!pollData) {
          setError('סקר לא נמצא');
          return;
        }
        
        pollIdRef.current = pollData.poll_id;
        
        const [statementsData, consensusPointsData, groupsData, groupStatsData, votesData] = await Promise.all([
          fetchStatementsByPollId(pollData.poll_id),
          fetchConsensusPointsByPollId(pollData.poll_id),
          fetchGroupsByPollId(pollData.poll_id),
          fetchGroupStatsByPollId(pollData.poll_id),
          fetchUserVotes(pollData.poll_id)
        ]);

        setPoll(pollData);
        setStatements(statementsData);
        setConsensusPoints(consensusPointsData);
        setGroups(groupsData);
        setGroupStats(groupStatsData);
        setUserVotes(votesData);
      } catch (error) {
        console.error('Error loading poll data:', error);
        setError('שגיאה בטעינת נתוני הסקר');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [slug]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!pollIdRef.current || loading) return;

    const pollId = pollIdRef.current;
    console.log('Setting up real-time subscriptions for poll:', pollId);

    // Create a channel for this specific poll
    const channel = supabase.channel(`poll-${pollId}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polis_votes',
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          console.log('Vote change detected:', payload);
          // Clear any existing debounced call
          if (debouncedRefetch.current) {
            clearTimeout(debouncedRefetch.current);
          }
          // Debounce the refetch to prevent multiple rapid calls
          debouncedRefetch.current = setTimeout(() => {
            refetchPollData(pollId);
          }, 500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polis_consensus_points',
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          console.log('Consensus points change detected:', payload);
          refetchPollData(pollId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polis_group_statement_stats',
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          console.log('Group stats change detected:', payload);
          refetchPollData(pollId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polis_groups',
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          console.log('Groups change detected:', payload);
          refetchPollData(pollId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polis_statements',
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          console.log('Statements change detected:', payload);
          refetchPollData(pollId);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates for poll:', pollId);
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (debouncedRefetch.current) {
        clearTimeout(debouncedRefetch.current);
      }
    };
  }, [pollIdRef.current, loading, slug]);

  return {
    poll,
    statements,
    consensusPoints,
    groups,
    groupStats,
    userVotes,
    loading,
    error,
    isLive
  };
};
