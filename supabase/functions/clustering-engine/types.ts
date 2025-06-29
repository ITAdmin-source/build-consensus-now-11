
export interface Vote {
  session_id: string;
  statement_id: string;
  vote_value: 'support' | 'oppose' | 'unsure';
  user_id?: string;
}

export interface Participant {
  session_id: string;
  votes: Record<string, number>; // statement_id -> numeric vote (-1, 0, 1)
}

export interface ClusteringConfig {
  pca_dimensions: number;
  consensus_threshold: number;
  min_group_size: number;
}

export interface ClusterResult {
  groups: Array<{
    group_id: string;
    participants: string[];
    center: number[];
    silhouette_score: number;
    name: string;
    description: string;
    color: string;
  }>;
  consensus_points: string[];
  opinion_space: Record<string, [number, number]>;
  metrics: Record<string, number>;
}
