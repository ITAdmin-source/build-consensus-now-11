
export function calculateClusteringMetrics(matrix: number[][], clusters: any[]): Record<string, number> {
  const avgSilhouette = clusters.reduce((sum, c) => sum + c.silhouette_score, 0) / clusters.length
  const clusterSizes = clusters.map(c => c.participants.length)
  const sizeVariance = clusterSizes.reduce((sum, size) => {
    const mean = clusterSizes.reduce((s, sz) => s + sz, 0) / clusterSizes.length
    return sum + Math.pow(size - mean, 2)
  }, 0) / clusterSizes.length
  
  return {
    silhouette_score: avgSilhouette,
    cluster_balance: 1 / (1 + sizeVariance), // Higher = more balanced clusters
    total_clusters: clusters.length,
    avg_cluster_size: clusterSizes.reduce((s, sz) => s + sz, 0) / clusterSizes.length
  }
}
