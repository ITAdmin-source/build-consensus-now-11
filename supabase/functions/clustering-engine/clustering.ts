
import { Participant, ClusteringConfig, ClusterResult, ClusteringState } from './types.ts';
import { Matrix } from 'https://esm.sh/ml-matrix@6.10.4';
import { findOptimalK, performKMeansClustering } from './kmeans.ts';
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

  // 2) Incremental PCA (recompute only when many new rows arrive)
  let components: [number[], number[]];
  const delta = participants.length - (state.prevParticipantCount || 0);
  if (state.prevComponents && delta < (poll.pca_update_interval || 10)) {
    components = state.prevComponents;
    console.log('Using cached PCA components');
  } else {
    console.log('Computing new PCA components');
    // exactly your existing eigen-decomp from pca.ts
    const dataMatrix = new Matrix(matrix);
    const means = dataMatrix.mean('column');
    const centered = dataMatrix.subRowVector(means);
    const cov = centered.transpose().mmul(centered).div(matrix.length - 1);
    const eig = cov.eig();
    const idxs = eig.realEigenvalues
      .map((v,i) => ({v,i}))
      .sort((a,b)=>b.v-a.v)
      .map(o=>o.i)
      .slice(0,2);
    components = [
      eig.eigenvectorMatrix.getColumn(idxs[0]),
      eig.eigenvectorMatrix.getColumn(idxs[1]),
    ];
    state.prevComponents = components;
    state.prevParticipantCount = participants.length;
  }

  // project into 2D space
  const opinionSpace: Record<string,[number,number]> = {};
  participants.forEach((p,i) => {
    const row = matrix[i];
    opinionSpace[p.session_id] = [
      row.reduce((s,v,j)=>s + v*components[0][j], 0),
      row.reduce((s,v,j)=>s + v*components[1][j], 0)
    ];
  });

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
