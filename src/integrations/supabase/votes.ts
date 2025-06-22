
import { supabase } from './client';
import { SessionManager } from '@/utils/sessionManager';

export const submitVote = async (
  statementId: string,
  voteValue: 'support' | 'oppose' | 'unsure'
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get session ID for anonymous users or as fallback
  const sessionId = SessionManager.getSessionId();
  
  // Determine if we should use user_id or session_id
  const voteData = user 
    ? { user_id: user.id, statement_id: statementId, vote_value: voteValue }
    : { session_id: sessionId, statement_id: statementId, vote_value: voteValue };

  // Check if user/session has already voted on this statement
  const existingVoteQuery = user
    ? supabase
        .from('polis_votes')
        .select('vote_id')
        .eq('user_id', user.id)
        .eq('statement_id', statementId)
    : supabase
        .from('polis_votes')
        .select('vote_id')
        .eq('session_id', sessionId)
        .eq('statement_id', statementId);

  const { data: existingVote } = await existingVoteQuery.single();

  if (existingVote) {
    // Update existing vote
    const { error } = await supabase
      .from('polis_votes')
      .update({ vote_value: voteValue })
      .eq('vote_id', existingVote.vote_id);

    if (error) {
      console.error('Error updating vote:', error);
      throw error;
    }
  } else {
    // Insert new vote
    const { error } = await supabase
      .from('polis_votes')
      .insert(voteData);

    if (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }
};

export const fetchUserVotes = async (pollId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = SessionManager.getSessionId();
  
  // Query votes based on whether user is authenticated or not
  const votesQuery = user
    ? supabase
        .from('polis_votes')
        .select(`
          statement_id,
          vote_value,
          polis_statements!inner(poll_id)
        `)
        .eq('user_id', user.id)
        .eq('polis_statements.poll_id', pollId)
    : supabase
        .from('polis_votes')
        .select(`
          statement_id,
          vote_value,
          polis_statements!inner(poll_id)
        `)
        .eq('session_id', sessionId)
        .eq('polis_statements.poll_id', pollId);

  const { data, error } = await votesQuery;

  if (error) {
    console.error('Error fetching user votes:', error);
    return {};
  }

  // Transform to Record<string, string> format
  const votes: Record<string, string> = {};
  data?.forEach(vote => {
    votes[vote.statement_id] = vote.vote_value;
  });

  return votes;
};
