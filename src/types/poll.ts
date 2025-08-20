export interface Poll {
  poll_id: string;
  title: string;
  description: string;
  category: string;
  time_left: number;
  is_expired: boolean;
  min_consensus_points_to_win: number;
  current_consensus_points: number;
  total_statements: number;
  total_votes: number;
  total_participants: number;
  allow_user_statements: boolean;
  auto_approve_statements: boolean;
  // status removed - now derived from round status
  min_support_pct: number;
  max_opposition_pct: number;
  min_votes_per_group: number;
  slug: string;
  created_at: string;
  created_by: string | null;
  round_id: string;
  round?: {
    round_id: string;
    title: string;
    start_time: string;
    end_time: string;
    publish_status: 'draft' | 'published';
    active_status?: 'pending' | 'active' | 'completed' | null;
  };
  clustering_min_groups?: number;
  clustering_max_groups?: number;
  clustering_min_participants?: number;
  clustering_cache_ttl_minutes?: number;
  clustering_batch_size?: number;
  clustering_algorithm_config?: {
    pca_dimensions: number;
    consensus_threshold: number;
    min_group_size: number;
  };
  last_clustering_job_id?: string;
  clustering_status?: 'never_run' | 'pending' | 'running' | 'completed' | 'failed';
  last_clustered_at?: string;
  support_button_label?: string;
  unsure_button_label?: string;
  oppose_button_label?: string;
  voting_goal?: number;
  min_statements_voted_to_end?: number;
}

export interface Statement {
  statement_id: string;
  poll_id: string;
  content_type: 'text' | 'image' | 'audio' | 'video';
  content: string;
  more_info?: string;
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
  cluster_center?: number[];
  silhouette_score?: number;
  stability_score?: number;
  opinion_space_coords?: Record<string, [number, number]>;
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

export interface ClusteringJob {
  job_id: string;
  poll_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  algorithm_version: string;
  total_votes: number;
  total_participants: number;
  groups_created?: number;
  consensus_points_found?: number;
  processing_time_ms?: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
}

export interface ClusteringMetric {
  metric_id: string;
  job_id: string;
  poll_id: string;
  metric_name: string;
  metric_value: number;
  metadata?: any;
  created_at: string;
}
