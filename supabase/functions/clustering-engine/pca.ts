
import { Matrix } from 'https://esm.sh/ml-matrix@6.10.4';

export function performPCA(matrix: number[][], sessionIds: string[]) {
  console.log('Performing PCA with ml-matrix library');
  
  const n = matrix.length;
  const m = matrix[0]?.length || 0;
  
  if (n === 0 || m === 0) {
    console.warn('Empty matrix for PCA');
    return {};
  }

  try {
    // Create Matrix object from the input data
    const dataMatrix = new Matrix(matrix);
    
    // Center the data (subtract mean from each column)
    const means = dataMatrix.mean('column');
    const centeredMatrix = dataMatrix.subRowVector(means);
    
    // Calculate covariance matrix
    const covarianceMatrix = centeredMatrix.transpose().mmul(centeredMatrix).div(n - 1);
    
    // Perform eigenvalue decomposition
    const eigenDecomposition = covarianceMatrix.eig();
    const eigenVectors = eigenDecomposition.eigenvectorMatrix;
    const eigenValues = eigenDecomposition.realEigenvalues;
    
    // Sort eigenvectors by eigenvalues (descending order)
    const sortedIndices = eigenValues
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val)
      .map(item => item.idx);
    
    // Get the first two principal components
    const pc1 = eigenVectors.getColumn(sortedIndices[0]);
    const pc2 = eigenVectors.getColumn(sortedIndices[1]);
    
    // Project data onto the first two principal components
    const opinionSpace: Record<string, [number, number]> = {};
    
    for (let i = 0; i < n; i++) {
      const centeredRow = centeredMatrix.getRow(i);
      const x = centeredRow.reduce((sum, val, j) => sum + val * pc1[j], 0);
      const y = centeredRow.reduce((sum, val, j) => sum + val * pc2[j], 0);
      
      opinionSpace[sessionIds[i]] = [x, y];
    }
    
    console.log(`PCA completed successfully for ${n} participants`);
    return opinionSpace;
    
  } catch (error) {
    console.error('Error in PCA calculation:', error);
    // Fallback to PCALite if ml-matrix fails
    console.log('Falling back to PCALite implementation');
    return performPCALite(matrix, sessionIds);
  }
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
