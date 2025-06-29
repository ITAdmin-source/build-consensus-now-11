
export function findOptimalK(matrix: number[][], minK: number, maxK: number): number {
  console.log(`Finding optimal k between ${minK} and ${maxK}`)
  
  if (matrix.length < minK) {
    console.warn(`Not enough participants for clustering: ${matrix.length} < ${minK}`)
    return Math.min(2, matrix.length)
  }
  
  let bestK = minK
  let bestSilhouette = -1

  for (let k = minK; k <= Math.min(maxK, matrix.length - 1); k++) {
    const clusters = performKMeansClustering(matrix, k, 1)
    if (clusters.length === 0) continue
    
    const avgSilhouette = clusters.reduce((sum, c) => sum + c.silhouette_score, 0) / clusters.length
    
    if (avgSilhouette > bestSilhouette) {
      bestSilhouette = avgSilhouette
      bestK = k
    }
  }

  console.log(`Optimal k: ${bestK} with silhouette score: ${bestSilhouette}`)
  return bestK
}

export function initializeCentroidsPlusPlus(matrix: number[][], k: number): number[][] {
  const centroids: number[][] = [];
  // 1) Choose first centroid at random
  centroids.push(matrix[Math.floor(Math.random() * matrix.length)]);
  // 2) Choose each subsequent centroid with probability ∝ squared distance
  while (centroids.length < k) {
    const distances = matrix.map(pt =>
      Math.min(...centroids.map(c => euclideanDistance(pt, c))) ** 2
    );
    const sum = distances.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < matrix.length; i++) {
      r -= distances[i];
      if (r <= 0) {
        centroids.push(matrix[i]);
        break;
      }
    }
  }
  return centroids;
}

export function performKMeansClustering(matrix: number[][], k: number, minGroupSize: number) {
  console.log(`Performing k-means clustering with k=${k}`)
  
  const n = matrix.length
  const m = matrix[0]?.length || 0
  
  if (n === 0 || m === 0) {
    console.warn('Cannot cluster empty matrix')
    return []
  }

  // Initialize centroids with k-means++ for better seeding
  let centroids = initializeCentroidsPlusPlus(matrix, k);
  
  let assignments = Array(n).fill(0)
  let iterations = 0
  const maxIterations = 100
  
  // K-means iterations
  while (iterations < maxIterations) {
    const newAssignments = Array(n).fill(0)
    
    // Assign points to nearest centroid
    for (let i = 0; i < n; i++) {
      let minDistance = Infinity
      let bestCluster = 0
      
      for (let j = 0; j < k; j++) {
        const distance = euclideanDistance(matrix[i], centroids[j])
        if (distance < minDistance) {
          minDistance = distance
          bestCluster = j
        }
      }
      
      newAssignments[i] = bestCluster
    }
    
    // Check for convergence
    if (assignments.every((val, i) => val === newAssignments[i])) {
      break
    }
    
    assignments = newAssignments
    
    // Update centroids
    for (let j = 0; j < k; j++) {
      const clusterPoints = matrix.filter((_, i) => assignments[i] === j)
      if (clusterPoints.length > 0) {
        centroids[j] = Array(m).fill(0).map((_, col) =>
          clusterPoints.reduce((sum, point) => sum + point[col], 0) / clusterPoints.length
        )
      }
    }
    
    iterations++
  }
  
  // Build cluster result
  const clusters = Array(k).fill(null).map((_, j) => {
    const participants = assignments
      .map((assignment, i) => assignment === j ? i : -1)
      .filter(i => i !== -1)
    
    const silhouette_score = calculateSilhouetteScore(matrix, assignments, j)
    
    return {
      participants,
      center: centroids[j],
      silhouette_score
    }
  }).filter(cluster => cluster.participants.length >= minGroupSize)
  
  console.log(`Clustering result: ${clusters.length} valid clusters`)
  return clusters
}

export function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}

export function calculateSilhouetteScore(matrix: number[][], assignments: number[], clusterIndex: number): number {
  const clusterPoints = assignments
    .map((assignment, i) => assignment === clusterIndex ? i : -1)
    .filter(i => i !== -1)
  
  if (clusterPoints.length <= 1) return 0
  
  let totalScore = 0
  
  for (const pointIndex of clusterPoints) {
    // Calculate average distance to same cluster
    const intraDistance = clusterPoints
      .filter(i => i !== pointIndex)
      .reduce((sum, i) => sum + euclideanDistance(matrix[pointIndex], matrix[i]), 0) / (clusterPoints.length - 1)
    
    // Calculate average distance to nearest other cluster
    let minInterDistance = Infinity
    const otherClusters = Array.from(new Set(assignments)).filter(c => c !== clusterIndex)
    
    for (const otherCluster of otherClusters) {
      const otherPoints = assignments
        .map((assignment, i) => assignment === otherCluster ? i : -1)
        .filter(i => i !== -1)
      
      if (otherPoints.length > 0) {
        const avgDistance = otherPoints
          .reduce((sum, i) => sum + euclideanDistance(matrix[pointIndex], matrix[i]), 0) / otherPoints.length
        minInterDistance = Math.min(minInterDistance, avgDistance)
      }
    }
    
    if (minInterDistance !== Infinity) {
      const silhouette = (minInterDistance - intraDistance) / Math.max(intraDistance, minInterDistance)
      totalScore += silhouette
    }
  }
  
  return totalScore / clusterPoints.length
}
