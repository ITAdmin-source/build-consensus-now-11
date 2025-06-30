
import { supabase } from './client';
import { Group, GroupStatementStats, ConsensusPoint } from '@/types/poll';

export const fetchGroupsByPollId = async (pollId: string): Promise<Group[]> => {
  // First get the groups
  const { data: groupsData, error: groupsError } = await supabase
    .from('polis_groups')
    .select('*')
    .eq('poll_id', pollId);

  if (groupsError) {
    console.error('Error fetching groups:', groupsError);
    return [];
  }

  if (!groupsData || groupsData.length === 0) {
    return [];
  }

  // Get member counts for each group (both session_id and user_id)
  const { data: membershipData, error: membershipError } = await supabase
    .from('polis_user_group_membership')
    .select('group_id, session_id, user_id')
    .eq('poll_id', pollId);

  if (membershipError) {
    console.error('Error fetching group memberships:', membershipError);
  }

  // Count members per group using both session_id and user_id
  const memberCounts = (membershipData || []).reduce((acc, membership) => {
    // Count if either session_id or user_id is present
    const participantId = membership.session_id || membership.user_id;
    if (participantId) {
      acc[membership.group_id] = (acc[membership.group_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Colors for groups - distinct and accessible
  const groupColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Transform to match Group interface with calculated member counts
  const transformedGroups = groupsData.map((group, index): Group => ({
    group_id: group.group_id,
    poll_id: group.poll_id || pollId,
    name: `קבוצה ${index + 1}`, // More user-friendly names: "Group 1", "Group 2"
    description: `קבוצת דעות עם ${memberCounts[group.group_id] || 0} משתתפים`,
    color: groupColors[index % groupColors.length], // Cycle through distinct colors
    member_count: memberCounts[group.group_id] || 0,
    algorithm: group.algorithm || 'k-means',
    created_at: group.created_at || new Date().toISOString()
  }));

  return transformedGroups;
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

  const transformedStats = data?.map((stat): GroupStatementStats => ({
    group_id: stat.group_id,
    statement_id: stat.statement_id,
    poll_id: stat.poll_id || pollId,
    support_pct: stat.support_pct || 0,
    oppose_pct: stat.oppose_pct || 0,
    unsure_pct: 100 - (stat.support_pct || 0) - (stat.oppose_pct || 0),
    total_votes: stat.total_votes || 0
  })) || [];

  return transformedStats;
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
