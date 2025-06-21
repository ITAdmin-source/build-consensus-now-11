
import { supabase } from './client';

export const submitVote = async (
  statementId: string,
  voteValue: 'support' | 'oppose' | 'unsure'
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to vote');
  }

  // Check if user has already voted on this statement
  const { data: existingVote } = await supabase
    .from('polis_votes')
    .select('vote_id')
    .eq('user_id', user.id)
    .eq('statement_id', statementId)
    .single();

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
      .insert({
        user_id: user.id,
        statement_id: statementId,
        vote_value: voteValue
      });

    if (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }
};

export const fetchUserVotes = async (pollId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {};
  }

  const { data, error } = await supabase
    .from('polis_votes')
    .select(`
      statement_id,
      vote_value,
      polis_statements!inner(poll_id)
    `)
    .eq('user_id', user.id)
    .eq('polis_statements.poll_id', pollId);

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
