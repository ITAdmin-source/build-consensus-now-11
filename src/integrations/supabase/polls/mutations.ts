
import { supabase } from '../client';

export const resetPollVotes = async (pollId: string) => {
  try {
    console.log('Resetting votes for poll:', pollId);
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Authenticated user:', user.id);

    // Use a database transaction to ensure all operations succeed or fail together
    const { data, error } = await supabase.rpc('reset_poll_data', {
      poll_id_param: pollId
    });

    if (error) {
      console.error('Error calling reset_poll_data function:', error);
      throw error;
    }

    console.log('Successfully reset all data for poll:', pollId);
    return { success: true };
  } catch (error) {
    console.error('Error in resetPollVotes:', error);
    throw error;
  }
};
