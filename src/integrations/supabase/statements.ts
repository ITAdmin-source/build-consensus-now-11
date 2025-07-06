
import { supabase } from './client';
import { Statement } from '@/types/poll';

export const fetchStatementsByPollId = async (pollId: string) => {
  try {
    const { data, error } = await supabase
      .from('polis_statements')
      .select(`
        *,
        polis_consensus_points(statement_id)
      `)
      .eq('poll_id', pollId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching statements:', error);
      throw error;
    }

    // Get vote statistics for each statement
    const statementIds = data?.map(s => s.statement_id) || [];
    
    let voteStats: Record<string, any> = {};
    if (statementIds.length > 0) {
      const { data: votes, error: votesError } = await supabase
        .from('polis_votes')
        .select('statement_id, vote_value')
        .in('statement_id', statementIds);

      if (votesError) {
        console.error('Error fetching vote stats:', votesError);
      } else {
        // Calculate vote statistics
        voteStats = votes?.reduce((acc, vote) => {
          if (!acc[vote.statement_id]) {
            acc[vote.statement_id] = { support: 0, oppose: 0, unsure: 0, total: 0 };
          }
          acc[vote.statement_id][vote.vote_value]++;
          acc[vote.statement_id].total++;
          return acc;
        }, {} as Record<string, any>) || {};
      }
    }

    // Transform the data to match our Statement interface
    return data?.map((statement): Statement => {
      const stats = voteStats[statement.statement_id] || { support: 0, oppose: 0, unsure: 0, total: 0 };
      const totalVotes = stats.total || 0;
      
      return {
        statement_id: statement.statement_id,
        poll_id: statement.poll_id,
        content_type: statement.content_type || 'text',
        content: statement.content,
        more_info: statement.more_info || undefined, // Include the new more_info field
        is_user_suggested: statement.is_user_suggested || false,
        is_approved: statement.is_approved || false,
        is_consensus_point: (statement.polis_consensus_points?.length || 0) > 0,
        support_pct: totalVotes > 0 ? Math.round((stats.support / totalVotes) * 100) : 0,
        oppose_pct: totalVotes > 0 ? Math.round((stats.oppose / totalVotes) * 100) : 0,
        unsure_pct: totalVotes > 0 ? Math.round((stats.unsure / totalVotes) * 100) : 0,
        total_votes: totalVotes,
        score: stats.support || 0 // Simple scoring for now
      };
    }) || [];
  } catch (error) {
    console.error('Error in fetchStatementsByPollId:', error);
    throw error;
  }
};

export const submitUserStatement = async (
  pollId: string, 
  content: string, 
  contentType: string = 'text',
  moreInfo?: string // Add optional moreInfo parameter
) => {
  try {
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
        more_info: moreInfo || null, // Include more_info in the insert
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
  } catch (error) {
    console.error('Error in submitUserStatement:', error);
    throw error;
  }
};
