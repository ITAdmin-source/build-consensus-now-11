
import { supabase } from './client';
import { Round, CreateRoundData, UpdateRoundData } from '@/types/round';

export const fetchAllRounds = async (): Promise<Round[]> => {
  const { data, error } = await supabase
    .from('polis_rounds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rounds:', error);
    throw error;
  }

  return data?.map(transformRoundData) || [];
};

export const fetchPublishedRounds = async (): Promise<Round[]> => {
  const { data, error } = await supabase
    .from('polis_rounds')
    .select('*')
    .eq('publish_status', 'published')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching published rounds:', error);
    throw error;
  }

  return data?.map(transformRoundData) || [];
};

export const fetchRoundById = async (roundId: string): Promise<Round | null> => {
  const { data, error } = await supabase
    .from('polis_rounds')
    .select('*')
    .eq('round_id', roundId)
    .single();

  if (error) {
    console.error('Error fetching round:', error);
    return null;
  }

  return data ? transformRoundData(data) : null;
};

export const createRound = async (roundData: CreateRoundData): Promise<Round> => {
  const { data, error } = await supabase
    .from('polis_rounds')
    .insert({
      title: roundData.title,
      description: roundData.description,
      start_time: roundData.start_time,
      end_time: roundData.end_time,
      publish_status: roundData.publish_status,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating round:', error);
    throw error;
  }

  return transformRoundData(data);
};

export const updateRound = async (roundData: UpdateRoundData): Promise<Round> => {
  const { round_id, ...updateFields } = roundData;
  
  const { data, error } = await supabase
    .from('polis_rounds')
    .update(updateFields)
    .eq('round_id', round_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating round:', error);
    throw error;
  }

  return transformRoundData(data);
};

export const deleteRound = async (roundId: string): Promise<void> => {
  const { error } = await supabase
    .from('polis_rounds')
    .delete()
    .eq('round_id', roundId);

  if (error) {
    console.error('Error deleting round:', error);
    throw error;
  }
};

function transformRoundData(round: any): Round {
  const now = new Date();
  const startTime = new Date(round.start_time);
  const endTime = new Date(round.end_time);
  
  let active_status: 'pending' | 'active' | 'completed' | null = null;
  
  if (round.publish_status === 'published') {
    if (now < startTime) {
      active_status = 'pending';
    } else if (now >= startTime && now <= endTime) {
      active_status = 'active';
    } else {
      active_status = 'completed';
    }
  }

  return {
    round_id: round.round_id,
    title: round.title,
    description: round.description,
    start_time: round.start_time,
    end_time: round.end_time,
    publish_status: round.publish_status,
    created_at: round.created_at,
    created_by: round.created_by,
    active_status,
  };
}
