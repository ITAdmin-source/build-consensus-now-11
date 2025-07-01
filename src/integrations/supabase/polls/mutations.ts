
import { supabase } from '../client';

interface ResetPollResponse {
  success: boolean;
  error?: string;
  total_deleted?: number;
  message?: string;
}

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

    // Type assertion to handle the JSON response - first convert to unknown, then to our type
    const response = data as unknown as ResetPollResponse;

    // Check if the function returned an error
    if (response && !response.success) {
      console.error('Function returned error:', response.error);
      throw new Error(response.error);
    }

    console.log('Successfully reset all data for poll:', pollId);
    if (response && response.total_deleted) {
      console.log('Total records deleted:', response.total_deleted);
    }
    
    return { success: true, data: response };
  } catch (error) {
    console.error('Error in resetPollVotes:', error);
    throw error;
  }
};
