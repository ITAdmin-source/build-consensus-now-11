
export interface Round {
  round_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  publish_status: 'draft' | 'published';
  created_at: string;
  created_by?: string;
  active_status?: 'pending' | 'active' | 'completed' | null;
}

export interface CreateRoundData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  publish_status: 'draft' | 'published';
}

export interface UpdateRoundData extends Partial<CreateRoundData> {
  round_id: string;
}
