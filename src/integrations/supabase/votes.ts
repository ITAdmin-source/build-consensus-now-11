
import { supabase } from './client';

export const submitVote = async (statementId: string, voteValue: 'support' | 'oppose' | 'unsure') => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get or create session ID for anonymous users
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }

  // Get statement details to find poll_id
  const { data: statement, error: statementError } = await supabase
    .from('polis_statements')
    .select('poll_id')
    .eq('statement_id', statementId)
    .single();

  if (statementError) {
    throw statementError;
  }

  const voteData = {
    statement_id: statementId,
    poll_id: statement.poll_id,
    vote_value: voteValue,
    user_id: user?.id || null,
    session_id: user ? null : sessionId,
  };

  const { error } = await supabase
    .from('polis_votes')
    .insert(voteData);

  if (error) {
    throw error;
  }

  // Optionally update participant vector for routing
  try {
    await updateParticipantVector(
      statement.poll_id, 
      user?.id || sessionId, 
      statementId, 
      voteValue
    );
  } catch (vectorError) {
    // Don't fail the vote if vector update fails
    console.warn('Failed to update participant vector:', vectorError);
  }
};

/**
 * Update participant opinion vector for improved routing
 */
async function updateParticipantVector(
  pollId: string, 
  participantId: string, 
  statementId: string, 
  voteValue: 'support' | 'oppose' | 'unsure'
) {
  // Check if routing is enabled
  const { data: routingEnabled } = await supabase
    .from('polis_system_settings')
    .select('setting_value')
    .eq('setting_key', 'statement_routing_enabled')
    .single();

  if (!routingEnabled || routingEnabled.setting_value !== 'true') {
    return; // Skip vector updates if routing is disabled
  }

  // Get current participant vector
  const { data: existingVector } = await supabase
    .from('polis_participant_vectors')
    .select('*')
    .eq('poll_id', pollId)
    .eq('participant_id', participantId)
    .single();

  // Convert vote to numeric value for vector
  const voteNumeric = voteValue === 'support' ? 1 : voteValue === 'oppose' ? -1 : 0;

  if (existingVector) {
    // Update existing vector
    const currentVector = existingVector.opinion_vector as number[] || [];
    const updatedVector = [...currentVector, voteNumeric];
    
    await supabase
      .from('polis_participant_vectors')
      .update({
        opinion_vector: updatedVector,
        vote_count: existingVector.vote_count + 1,
        last_updated: new Date().toISOString()
      })
      .eq('vector_id', existingVector.vector_id);
  } else {
    // Create new vector
    await supabase
      .from('polis_participant_vectors')
      .insert({
        poll_id: pollId,
        participant_id: participantId,
        opinion_vector: [voteNumeric],
        vote_count: 1
      });
  }
}

export const getUserVotes = async (pollId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = sessionStorage.getItem('session_id');

  let query = supabase
    .from('polis_votes')
    .select('statement_id, vote_value')
    .eq('poll_id', pollId);

  if (user) {
    query = query.eq('user_id', user.id);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    return {};
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user votes:', error);
    return {};
  }

  return data?.reduce((acc, vote) => {
    acc[vote.statement_id] = vote.vote_value;
    return acc;
  }, {} as Record<string, string>) || {};
};
