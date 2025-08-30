
import { supabase } from './client';
import { getOrCreateSessionId } from '@/utils/sessionUtils';

export const submitVote = async (statementId: string, voteValue: 'support' | 'oppose' | 'unsure') => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Always ensure session ID exists
  const sessionId = getOrCreateSessionId();

  // Get statement details to find poll_id
  const { data: statement, error: statementError } = await supabase
    .from('polis_statements')
    .select('poll_id')
    .eq('statement_id', statementId)
    .single();

  if (statementError) {
    throw statementError;
  }

  // Check if the poll's round allows voting
  const { data: pollWithRound, error: pollError } = await supabase
    .from('polis_polls')
    .select(`
      poll_id,
      polis_rounds(start_time, end_time, publish_status)
    `)
    .eq('poll_id', statement.poll_id)
    .single();

  if (pollError) {
    throw pollError;
  }

  // Validate round status before submitting vote
  if (pollWithRound.polis_rounds) {
    const round = pollWithRound.polis_rounds;
    const now = new Date();
    const startTime = new Date(round.start_time);
    const endTime = new Date(round.end_time);
    
    if (round.publish_status !== 'published') {
      throw new Error('ההצבעה אינה זמינה - הסיבוב עדיין לא פורסם');
    }
    
    if (now < startTime) {
      throw new Error('ההצבעה עדיין לא התחילה');
    }
    
    if (now > endTime) {
      throw new Error('זמן ההצבעה הסתיים');
    }
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
  const sessionId = getOrCreateSessionId();

  let query = supabase
    .from('polis_votes')
    .select('statement_id, vote_value')
    .eq('poll_id', pollId);

  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    query = query.eq('session_id', sessionId);
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

export interface UserVoteWithStatement {
  statement_text: string;
  vote_value: 'support' | 'oppose' | 'unsure';
  statement_id: string;
}

export const getUserVotesWithStatements = async (pollId: string): Promise<UserVoteWithStatement[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = getOrCreateSessionId();

  let query = supabase
    .from('polis_votes')
    .select(`
      statement_id,
      vote_value,
      polis_statements(content)
    `)
    .eq('poll_id', pollId);

  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    query = query.eq('session_id', sessionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user votes with statements:', error);
    throw error;
  }

  return data?.map(vote => ({
    statement_id: vote.statement_id,
    statement_text: (vote.polis_statements as any)?.content || '',
    vote_value: vote.vote_value as 'support' | 'oppose' | 'unsure'
  })) || [];
};
