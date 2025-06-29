
import { Participant, ClusteringConfig, ClusterResult, ClusteringState } from './types.ts';
import { findOptimalK, performKMeansClustering } from './kmeans.ts';
import { performPCA } from './pca.ts';
import { detectAdvancedConsensus } from './consensus.ts';
import { calculateClusteringMetrics } from './metrics.ts';
import seedrandom from 'https://esm.sh/seedrandom@3.0.5';

export async function performAdvancedClustering(
  participants: Participant[],
  statementIds: string[],
  poll: any,
  config: ClusteringConfig,
  state: ClusteringState
): Promise<ClusterResult> {

  console.log('Performing advanced clustering with pol.is algorithm')

  // 1) seedable RNG using poll-specific seed
  const seed = poll.random_seed || poll.poll_id;
  const rng = seedrandom(seed);
  console.log(`Using RNG seed: ${seed}`);
  
  // Convert to matrix format for mathematical operations
  const matrix = participants.map(p => 
    statementIds.map(sid => p.votes[sid] || 0)
  );

  console.log(`Matrix dimensions: ${matrix.length} x ${matrix[0]?.length || 0}`)

  // 2) Opinion space mapping using existing PCA implementation
  let opinionSpace: Record<string, [number, number]>;
  const delta = participants.length - (state.prevParticipantCount || 0);
  
  if (state.prevComponents && delta < (poll.pca_update_interval || 10)) {
    // Use cached PCA components - create a minimal opinion space from cached data
    console.log('Using cached PCA components');
    opinionSpace = {};
    participants.forEach((p, i) => {
      const row = matrix[i];
      opinionSpace[p.session_id] = [
        row.reduce((s, v, j) => s + v * (state.prevComponents![0][j] || 0), 0),
        row.reduce((s, v, j) => s + v * (state.prevComponents![1][j] || 0), 0)
      ];
    });
  } else {
    console.log('Computing new PCA components');
    // Use the existing performPCA function
    opinionSpace = performPCA(matrix, participants.map(p => p.session_id));
    
    // Update state for future caching
    state.prevParticipantCount = participants.length;
    // Note: we can't easily extract components from performPCA, so we'll skip component caching for now
    // This is fine as performPCA has its own optimizations
  }

  // 3) Micro-clustering
  const microK = Math.min(config.micro_k || 100, participants.length - 1);
  const microClusters = performKMeansClustering(
    matrix, microK, 1, () => rng()
  );
  const microCenters = microClusters.map(c => c.center);

  // 4) Candidate K + smoothing
  const minK = poll.clustering_min_groups || 2;
  const maxK = Math.min(poll.clustering_max_groups || 5, participants.length - 1);
  const rawCandidateK = findOptimalK(matrix, minK, maxK, () => rng());
  const thresh = config.k_switch_threshold || 4;
  if (rawCandidateK === state.prevK) {
    state.consecutiveKcount = (state.consecutiveKcount || 0) + 1;
  } else {
    state.prevK = rawCandidateK;
    state.consecutiveKcount = 1;
  }
  const optimalK = state.consecutiveKcount! >= thresh
    ? state.prevK!
    : rawCandidateK;

  console.log(`Using optimal K: ${optimalK} (consecutive count: ${state.consecutiveKcount})`);

  // 5) Meta-cluster microCenters → final clusters
  const metaClusters = performKMeansClustering(
    microCenters, optimalK, config.min_group_size, () => rng()
  );

  // 6) assign participants by micro→meta mapping
  const finalAssignments = new Array(participants.length);
  microClusters.forEach((mc, mi) =>
    mc.participants.forEach(pi => {
      const metaIdx = metaClusters.findIndex(m => m.participants.includes(mi));
      finalAssignments[pi] = metaIdx;
    })
  );

  // 7) build groups[] exactly as before but using finalAssignments
  const colors = ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6'];
  const groups = metaClusters.map((cluster,i) => ({
    group_id: `group_${i+1}`,
    participants: participants
      .filter((_, idx) => finalAssignments[idx] === i)
      .map(p => p.session_id),
    center: cluster.center,
    silhouette_score: cluster.silhouette_score,
    name: `קבוצה ${i+1}`,
    description: `קבוצת דעות עם ${cluster.participants.length} משתתפים`,
    color: colors[i % colors.length]
  }));
 
  // Advanced consensus detection
  const consensusPoints = detectAdvancedConsensus(
    matrix,
    metaClusters,
    statementIds,
    config.consensus_threshold,
    poll.min_support_pct || 50,
    poll.max_opposition_pct || 50
  )

  // Calculate clustering metrics
  const metrics = calculateClusteringMetrics(matrix, metaClusters)

  console.log(`Consensus points found: ${consensusPoints.length}`)
  console.log(`Clustering metrics:`, metrics)

  return {
    groups,
    consensus_points: consensusPoints,
    opinion_space: opinionSpace,
    metrics
  }
}
