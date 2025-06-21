
import { supabase } from './client';
import { Statement } from '@/types/poll';

export const fetchStatementsByPollId = async (pollId: string) => {
  const { data, error } = await supabase
    .from('polis_statements')
    .select('*')
    .eq('poll_id', pollId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching statements:', error);
    throw error;
  }

  // Transform the data to match our Statement interface with default values
  return data?.map((statement): Statement => ({
    statement_id: statement.statement_id,
    poll_id: statement.poll_id,
    content_type: statement.content_type || 'text',
    content: statement.content,
    is_user_suggested: statement.is_user_suggested || false,
    is_approved: statement.is_approved || false,
    is_consensus_point: false, // Will be calculated
    support_pct: 0, // Will be calculated
    oppose_pct: 0, // Will be calculated
    unsure_pct: 0, // Will be calculated
    total_votes: 0, // Will be calculated
    score: 0 // Will be calculated
  })) || [];
};

export const submitUserStatement = async (
  pollId: string, 
  content: string, 
  contentType: string = 'text'
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to submit statements');
  }

  const { data, error } = await supabase
    .from('polis_statements')
    .insert({
      poll_id: pollId,
      content,
      content_type: contentType as 'text' | 'image' | 'audio' | 'video',
      created_by_user_id: user.id,
      is_user_suggested: true,
      is_approved: false // Will need admin approval
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting statement:', error);
    throw error;
  }

  return data;
};
