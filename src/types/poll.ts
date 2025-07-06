export interface Poll {
  poll_id: string;
  title: string;
  topic: string;
  description: string;
  category: string;
  end_time: string;
  time_left: number;
  is_expired: boolean;
  min_consensus_points_to_win: number;
  current_consensus_points: number;
  total_statements: number;
  total_votes: number;
  total_participants: number;
  allow_user_statements: boolean;
  auto_approve_statements: boolean;
  status: 'draft' | 'active' | 'closed';
  min_support_pct: number;
  max_opposition_pct: number;
  min_votes_per_group: number;
  slug: string;
  created_at: string;
  created_by: string | null;
  // New clustering fields
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
}

export interface Statement {
  statement_id: string;
  poll_id: string;
  content_type: 'text' | 'image' | 'audio' | 'video';
  content: string;
  more_info?: string; // New optional field for additional information
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
  // New clustering fields
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

// New clustering-related types
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
