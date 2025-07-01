
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

    // Call the database function that returns JSON with success/error info
    const { data, error } = await supabase.rpc('reset_poll_data', {
      poll_id_param: pollId
    });

    if (error) {
      console.error('Error calling reset_poll_data function:', error);
      throw error;
    }

    console.log('Reset poll data response:', data);

    // Check if the function returned an error
    if (data && !data.success) {
      console.error('Function returned error:', data.error);
      throw new Error(data.error);
    }

    console.log('Successfully reset all data for poll:', pollId);
    if (data && data.total_deleted) {
      console.log('Total records deleted:', data.total_deleted);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in resetPollVotes:', error);
    throw error;
  }
};
