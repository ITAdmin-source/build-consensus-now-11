
import { supabase } from '../client';

export const resetPollVotes = async (pollId: string) => {
  try {
    console.log('Resetting votes for poll:', pollId);
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Delete voting-related data in correct order to avoid foreign key conflicts
    // 1. Delete consensus points
    const { error: consensusError } = await supabase
      .from('polis_consensus_points')
      .delete()
      .eq('poll_id', pollId);
    
    if (consensusError) {
      console.error('Error deleting consensus points:', consensusError);
      throw consensusError;
    }

    // 2. Delete group statement stats
    const { error: statsError } = await supabase
      .from('polis_group_statement_stats')
      .delete()
      .eq('poll_id', pollId);
    
    if (statsError) {
      console.error('Error deleting group stats:', statsError);
      throw statsError;
    }

    // 3. Delete user group memberships
    const { error: membershipError } = await supabase
      .from('polis_user_group_membership')
      .delete()
      .eq('poll_id', pollId);
    
    if (membershipError) {
      console.error('Error deleting group memberships:', membershipError);
      throw membershipError;
    }

    // 4. Delete groups
    const { error: groupsError } = await supabase
      .from('polis_groups')
      .delete()
      .eq('poll_id', pollId);
    
    if (groupsError) {
      console.error('Error deleting groups:', groupsError);
      throw groupsError;
    }

    // 5. Delete cluster cache
    const { error: cacheError } = await supabase
      .from('polis_cluster_cache')
      .delete()
      .eq('poll_id', pollId);
    
    if (cacheError) {
      console.error('Error deleting cluster cache:', cacheError);
      throw cacheError;
    }

    // 6. Delete clustering metrics
    const { error: metricsError } = await supabase
      .from('polis_clustering_metrics')
      .delete()
      .eq('poll_id', pollId);
    
    if (metricsError) {
      console.error('Error deleting clustering metrics:', metricsError);
      throw metricsError;
    }

    // 7. Delete clustering jobs
    const { error: jobsError } = await supabase
      .from('polis_clustering_jobs')
      .delete()
      .eq('poll_id', pollId);
    
    if (jobsError) {
      console.error('Error deleting clustering jobs:', jobsError);
      throw jobsError;
    }

    // 8. Delete votes (core data)
    const { error: votesError } = await supabase
      .from('polis_votes')
      .delete()
      .eq('poll_id', pollId);
    
    if (votesError) {
      console.error('Error deleting votes:', votesError);
      throw votesError;
    }

    // 9. Update poll metadata to reset clustering status
    const { error: pollUpdateError } = await supabase
      .from('polis_polls')
      .update({
        clustering_status: 'never_run',
        last_clustered_at: null,
        last_clustering_job_id: null
      })
      .eq('poll_id', pollId);

    if (pollUpdateError) {
      console.error('Error updating poll status:', pollUpdateError);
      throw pollUpdateError;
    }

    console.log('Successfully reset all votes for poll:', pollId);
    return { success: true };
  } catch (error) {
    console.error('Error in resetPollVotes:', error);
    throw error;
  }
};
