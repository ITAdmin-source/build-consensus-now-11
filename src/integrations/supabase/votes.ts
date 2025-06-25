
import { supabase } from './client';
import { SessionManager } from '@/utils/sessionManager';

export const submitVote = async (
  statementId: string,
  voteValue: 'support' | 'oppose' | 'unsure'
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get session ID for anonymous users or as fallback
    const sessionId = SessionManager.getSessionId();
    console.log('Submitting vote:', {
      statementId,
      voteValue,
      user: user ? 'authenticated' : 'anonymous',
      sessionId: user ? 'N/A' : sessionId
    });
    
    // First, get the poll_id for this statement
    const { data: statementData, error: statementError } = await supabase
      .from('polis_statements')
      .select('poll_id')
      .eq('statement_id', statementId)
      .single();

    if (statementError) {
      console.error('Error fetching statement poll_id:', statementError);
      throw statementError;
    }

    const pollId = statementData.poll_id;

    // Determine if we should use user_id or session_id
    const voteData = user 
      ? { 
          user_id: user.id, 
          statement_id: statementId, 
          vote_value: voteValue,
          poll_id: pollId,
          session_id: null // Explicitly set to null for authenticated users
        }
      : { 
          session_id: sessionId, 
          statement_id: statementId, 
          vote_value: voteValue,
          poll_id: pollId,
          user_id: null // Explicitly set to null for anonymous users
        };

    console.log('Vote data to insert:', voteData);

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

    const { data: existingVote, error: checkError } = await existingVoteQuery.maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      throw checkError;
    }

    if (existingVote) {
      console.log('Updating existing vote:', existingVote.vote_id);
      // Update existing vote
      const { error } = await supabase
        .from('polis_votes')
        .update({ vote_value: voteValue })
        .eq('vote_id', existingVote.vote_id);

      if (error) {
        console.error('Error updating vote:', error);
        throw error;
      }
      
      console.log('Vote updated successfully');
    } else {
      console.log('Inserting new vote');
      // Insert new vote
      const { data: insertedVote, error } = await supabase
        .from('polis_votes')
        .insert(voteData)
        .select();

      if (error) {
        console.error('Error submitting vote:', error);
        console.error('Vote data that failed:', voteData);
        throw error;
      }
      
      console.log('Vote inserted successfully:', insertedVote);
    }
  } catch (error) {
    console.error('Error in submitVote:', error);
    throw error;
  }
};

export const fetchUserVotes = async (pollId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = SessionManager.getSessionId();
    
    console.log('Fetching user votes for poll:', pollId, 'user:', user ? 'authenticated' : 'anonymous');
    
    // Query votes based on whether user is authenticated or not
    const votesQuery = user
      ? supabase
          .from('polis_votes')
          .select('statement_id, vote_value')
          .eq('user_id', user.id)
          .eq('poll_id', pollId)
      : supabase
          .from('polis_votes')
          .select('statement_id, vote_value')
          .eq('session_id', sessionId)
          .eq('poll_id', pollId);

    const { data, error } = await votesQuery;

    if (error) {
      console.error('Error fetching user votes:', error);
      return {};
    }

    console.log('Fetched votes:', data);

    // Transform to Record<string, string> format
    const votes: Record<string, string> = {};
    data?.forEach(vote => {
      votes[vote.statement_id] = vote.vote_value;
    });

    return votes;
  } catch (error) {
    console.error('Error in fetchUserVotes:', error);
    return {};
  }
};
