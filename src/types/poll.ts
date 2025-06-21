
export interface Poll {
  poll_id: string;
  title: string;
  topic: string;
  description: string;
  category: string;
  end_time: string;
  min_consensus_points_to_win: number;
  allow_user_statements: boolean;
  auto_approve_statements: boolean;
  status: 'draft' | 'active' | 'closed';
  min_support_pct: number;
  max_opposition_pct: number;
  min_votes_per_group: number;
  current_consensus_points: number;
  total_statements: number;
  total_votes: number;
}

export interface Statement {
  statement_id: string;
  poll_id: string;
  content_type: 'text' | 'image' | 'audio' | 'video';
  content: string;
  is_user_suggested: boolean;
  is_approved: boolean;
  is_consensus_point: boolean;
  support_pct: number;
  oppose_pct: number;
  unsure_pct: number;
  total_votes: number;
  score: number;
}

export interface Vote {
  vote_id: string;
  user_id: string;
  statement_id: string;
  vote_value: 'support' | 'oppose' | 'unsure';
  voted_at: string;
}

export interface ConsensusPoint {
  statement_id: string;
  poll_id: string;
  detected_at: string;
  statement: Statement;
}

export interface Group {
  group_id: string;
  poll_id: string;
  name: string;
  description: string;
  color: string;
  member_count: number;
  algorithm: string;
  created_at: string;
}

export interface GroupStatementStats {
  group_id: string;
  statement_id: string;
  poll_id: string;
  support_pct: number;
  oppose_pct: number;
  unsure_pct: number;
  total_votes: number;
}
