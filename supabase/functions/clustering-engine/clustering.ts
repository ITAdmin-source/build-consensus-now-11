
import { Participant, ClusteringConfig, ClusterResult } from './types.ts';
import { performPCA } from './pca.ts';
import { findOptimalK, performKMeansClustering } from './kmeans.ts';
import { detectAdvancedConsensus } from './consensus.ts';
import { calculateClusteringMetrics } from './metrics.ts';

export async function performAdvancedClustering(
  participants: Participant[],
  statementIds: string[],
  poll: any,
  config: ClusteringConfig
): Promise<ClusterResult> {
  console.log('Performing advanced clustering with pol.is algorithm')

  // Convert to matrix format for mathematical operations
  const matrix = participants.map(p => 
    statementIds.map(sid => p.votes[sid] || 0)
  )

  console.log(`Matrix dimensions: ${matrix.length} x ${matrix[0]?.length || 0}`)

  // Perform PCA for dimensionality reduction and opinion space mapping
  const opinionSpace = performPCA(matrix, participants.map(p => p.session_id))

  // Dynamic k-means clustering with optimal k selection
  const minK = poll.clustering_min_groups || 2
  const maxK = Math.min(poll.clustering_max_groups || 5, participants.length - 1)
  const optimalK = findOptimalK(matrix, minK, maxK)
  
  console.log(`Optimal k selected: ${optimalK} (range: ${minK}-${maxK})`)
  
  // Use deterministic seed for reproducible clustering results (optional)
  const clusteringSeed = poll.clustering_seed || poll.poll_id;
  
  // run k-means several times and pick the best by silhouette
  let bestClusters: any[] = []
  let bestSil = -Infinity
  const restarts = 3
  for (let i = 0; i < restarts; i++) {
    // Use different seeds for each restart to explore different solutions
    const restartSeed = clusteringSeed ? `${clusteringSeed}-${i}` : undefined;
    const trial = performKMeansClustering(matrix, optimalK, config.min_group_size, restartSeed)
    const sil = calculateClusteringMetrics(matrix, trial).silhouette_score
    console.log(`Restart ${i+1}/${restarts}: silhouette ${sil}`)
    if (sil > bestSil) {
      bestSil = sil
      bestClusters = trial
    }
  }
  console.log(`Selected best clustering after ${restarts} restarts (silhouette=${bestSil})`)
  const clusters = bestClusters
  
  console.log(`K-means completed: ${clusters.length} clusters`)

  // Assign group metadata
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
  const groups = clusters.map((cluster, index) => ({
    group_id: `group_${index + 1}`,
    participants: cluster.participants.map(i => participants[i].session_id),
    center: cluster.center,
    silhouette_score: cluster.silhouette_score,
    name: `קבוצה ${index + 1}`,
    description: `קבוצת דעות עם ${cluster.participants.length} משתתפים`,
    color: colors[index % colors.length]
  }))

  // Advanced consensus detection
  const consensusPoints = detectAdvancedConsensus(
    matrix,
    clusters,
    statementIds,
    config.consensus_threshold,
    poll.min_support_pct || 50,
    poll.max_opposition_pct || 50
  )

  // Calculate clustering metrics
  const metrics = calculateClusteringMetrics(matrix, clusters)

  console.log(`Consensus points found: ${consensusPoints.length}`)
  console.log(`Clustering metrics:`, metrics)

  return {
    groups,
    consensus_points: consensusPoints,
    opinion_space: opinionSpace,
    metrics
  }
}
