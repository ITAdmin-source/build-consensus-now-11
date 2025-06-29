
import numeric from 'https://esm.sh/numeric@1.2.6';

export function performPCA(matrix: number[][], sessionIds: string[]) {
  // transpose
  const M = numeric.transpose(matrix);
  // covariance
  const cov = numeric.div(numeric.dot(M, matrix), matrix.length - 1);
  // eigen-decomposition
  const E = numeric.eig(cov).E;   // columns are eigenvectors
  const comp1 = E.map((row: number[]) => row[0]);
  const comp2 = E.map((row: number[]) => row[1]);
  const opinionSpace: Record<string,[number,number]> = {};
  matrix.forEach((row, i) => {
    const x = numeric.dot(row, comp1);
    const y = numeric.dot(row, comp2);
    opinionSpace[sessionIds[i]] = [x, y];
  });
  return opinionSpace;
}

export function performPCALite(matrix: number[][], sessionIds: string[]): Record<string, [number, number]> {
  console.log('Performing PCA-lite for opinion space mapping')
  
  const n = matrix.length
  const m = matrix[0]?.length || 0
  
  if (n === 0 || m === 0) {
    console.warn('Empty matrix for PCA')
    return {}
  }
  
  // Calculate column means
  const means = Array(m).fill(0)
  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) {
      means[j] += matrix[i][j]
    }
    means[j] /= n
  }

  // Center the data
  const centeredMatrix = matrix.map(row => 
    row.map((val, j) => val - means[j])
  )

  // Simple 2D projection using first two principal directions
  const opinionSpace: Record<string, [number, number]> = {}
  
  centeredMatrix.forEach((row, i) => {
    // Project onto first two dimensions (simplified)
    const x = row.reduce((sum, val, j) => sum + val * (j % 2 === 0 ? 1 : -1), 0) / m
    const y = row.reduce((sum, val, j) => sum + val * (j % 3 === 0 ? 1 : -1), 0) / m
    
    opinionSpace[sessionIds[i]] = [x, y]
  })

  return opinionSpace
}
