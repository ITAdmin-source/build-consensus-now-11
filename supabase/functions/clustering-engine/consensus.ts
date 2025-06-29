
export function detectAdvancedConsensus(
  matrix: number[][],
  clusters: any[],
  statementIds: string[],
  consensusThreshold: number,
  minSupportPct: number,
  maxOppositionPct: number
): string[] {
  console.log('Detecting advanced consensus points')
  
  const consensusPoints: string[] = []
  
  for (let statementIndex = 0; statementIndex < statementIds.length; statementIndex++) {
    let isConsensus = true
    let totalSupport = 0
    let totalOppose = 0
    let totalVotes = 0
    
    // Check each cluster's stance on this statement
    for (const cluster of clusters) {
      const clusterVotes = cluster.participants.map((pIndex: number) => matrix[pIndex][statementIndex])
      const support = clusterVotes.filter(v => v === 1).length
      const oppose = clusterVotes.filter(v => v === -1).length
      const total = clusterVotes.length
      
      const supportPct = (support / total) * 100
      const opposePct = (oppose / total) * 100
      
      // Check if this cluster meets consensus criteria
      if (supportPct < minSupportPct || opposePct > maxOppositionPct) {
        isConsensus = false
        break
      }
      
      totalSupport += support
      totalOppose += oppose
      totalVotes += total
    }
    
    // Additional overall consensus check
    if (isConsensus && totalVotes > 0) {
      const overallSupportPct = (totalSupport / totalVotes) * 100
      const overallOpposePct = (totalOppose / totalVotes) * 100
      
      if (overallSupportPct >= consensusThreshold * 100 && overallOpposePct <= (1 - consensusThreshold) * 100) {
        consensusPoints.push(statementIds[statementIndex])
      }
    }
  }
  
  console.log(`Found ${consensusPoints.length} consensus points`)
  return consensusPoints
}
