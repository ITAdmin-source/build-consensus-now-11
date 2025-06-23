
import { supabase } from './client';

export const fetchAdminStats = async () => {
  try {
    // Get active polls count
    const { data: activePolls, error: pollsError } = await supabase
      .from('polis_polls')
      .select('poll_id')
      .eq('status', 'active');

    if (pollsError) throw pollsError;

    // Get total participants (distinct session_ids from votes)
    const { data: participants, error: participantsError } = await supabase
      .from('polis_votes')
      .select('session_id');

    if (participantsError) throw participantsError;

    const uniqueParticipants = new Set(participants?.map(p => p.session_id) || []);

    // Get votes from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayVotes, error: votesError } = await supabase
      .from('polis_votes')
      .select('vote_id')
      .gte('voted_at', today.toISOString());

    if (votesError) throw votesError;

    // Get pending statements count
    const { data: pendingStatements, error: pendingError } = await supabase
      .from('polis_statements')
      .select('statement_id')
      .eq('is_approved', false)
      .eq('is_user_suggested', true);

    if (pendingError) throw pendingError;

    return {
      activePolls: activePolls?.length || 0,
      totalParticipants: uniqueParticipants.size,
      votesToday: todayVotes?.length || 0,
      pendingStatements: pendingStatements?.length || 0
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      activePolls: 0,
      totalParticipants: 0,
      votesToday: 0,
      pendingStatements: 0
    };
  }
};

export const fetchPendingStatements = async () => {
  const { data, error } = await supabase
    .from('polis_statements')
    .select(`
      statement_id,
      content,
      content_type,
      created_at,
      poll_id,
      polis_polls!inner(title)
    `)
    .eq('is_approved', false)
    .eq('is_user_suggested', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending statements:', error);
    throw error;
  }

  return data || [];
};

export const approveStatement = async (statementId: string) => {
  const { error } = await supabase
    .from('polis_statements')
    .update({ is_approved: true })
    .eq('statement_id', statementId);

  if (error) {
    console.error('Error approving statement:', error);
    throw error;
  }
};

export const rejectStatement = async (statementId: string) => {
  const { error } = await supabase
    .from('polis_statements')
    .delete()
    .eq('statement_id', statementId);

  if (error) {
    console.error('Error rejecting statement:', error);
    throw error;
  }
};

export const extendPollTime = async (pollId: string, newEndTime: string) => {
  const { error } = await supabase
    .from('polis_polls')
    .update({ end_time: newEndTime })
    .eq('poll_id', pollId);

  if (error) {
    console.error('Error extending poll time:', error);
    throw error;
  }
};
