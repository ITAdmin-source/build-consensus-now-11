
import { supabase } from './client';
import { Group, GroupStatementStats, ConsensusPoint } from '@/types/poll';

export const fetchGroupsByPollId = async (pollId: string): Promise<Group[]> => {
  const { data, error } = await supabase
    .from('polis_groups')
    .select('*')
    .eq('poll_id', pollId);

  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }

  // Transform to match Group interface with default values
  return data?.map((group): Group => ({
    group_id: group.group_id,
    poll_id: group.poll_id || pollId,
    name: `קבוצה ${group.group_id.slice(0, 8)}`, // Generate name from ID
    description: `קבוצה שנוצרה על ידי ${group.algorithm}`,
    color: '#3B82F6', // Default color
    member_count: 0, // Will be calculated
    algorithm: group.algorithm || 'k-means',
    created_at: group.created_at || new Date().toISOString()
  })) || [];
};

export const fetchGroupStatsByPollId = async (pollId: string): Promise<GroupStatementStats[]> => {
  const { data, error } = await supabase
    .from('polis_group_statement_stats')
    .select('*')
    .eq('poll_id', pollId);

  if (error) {
    console.error('Error fetching group stats:', error);
    return [];
  }

  return data?.map((stat): GroupStatementStats => ({
    group_id: stat.group_id,
    statement_id: stat.statement_id,
    poll_id: stat.poll_id || pollId,
    support_pct: stat.support_pct || 0,
    oppose_pct: stat.oppose_pct || 0,
    unsure_pct: 100 - (stat.support_pct || 0) - (stat.oppose_pct || 0),
    total_votes: stat.total_votes || 0
  })) || [];
};

export const fetchConsensusPointsByPollId = async (pollId: string): Promise<ConsensusPoint[]> => {
  const { data, error } = await supabase
    .from('polis_consensus_points')
    .select(`
      *,
      polis_statements(*)
    `)
    .eq('poll_id', pollId);

  if (error) {
    console.error('Error fetching consensus points:', error);
    return [];
  }

  return data?.map((cp): ConsensusPoint => ({
    statement_id: cp.statement_id,
    poll_id: cp.poll_id,
    detected_at: cp.detected_at || new Date().toISOString(),
    statement: {
      statement_id: cp.polis_statements.statement_id,
      poll_id: cp.polis_statements.poll_id,
      content_type: cp.polis_statements.content_type || 'text',
      content: cp.polis_statements.content,
      is_user_suggested: cp.polis_statements.is_user_suggested || false,
      is_approved: cp.polis_statements.is_approved || false,
      is_consensus_point: true,
      support_pct: 0,
      oppose_pct: 0,
      unsure_pct: 0,
      total_votes: 0,
      score: 0
    }
  })) || [];
};
