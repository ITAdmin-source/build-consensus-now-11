
export interface AlgorithmConfig {
  pca_dimensions: number;
  consensus_threshold: number;
  min_group_size: number;
}

export interface ClusteringConfig {
  clustering_min_groups: number;
  clustering_max_groups: number;
  clustering_min_participants: number;
  clustering_cache_ttl_minutes: number;
  clustering_batch_size: number;
  clustering_algorithm_config: AlgorithmConfig;
  min_support_pct: number;
  max_opposition_pct: number;
  min_votes_per_group: number;
}

export const DEFAULT_CONFIG: ClusteringConfig = {
  clustering_min_groups: 2,
  clustering_max_groups: 5,
  clustering_min_participants: 3,
  clustering_cache_ttl_minutes: 60,
  clustering_batch_size: 100,
  clustering_algorithm_config: {
    pca_dimensions: 2,
    consensus_threshold: 0.7,
    min_group_size: 2
  },
  min_support_pct: 50,
  max_opposition_pct: 50,
  min_votes_per_group: 1
};
