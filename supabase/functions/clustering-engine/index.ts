
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Vote {
  session_id: string;
  statement_id: string;
  vote_value: 'support' | 'oppose' | 'unsure';
}

interface Participant {
  session_id: string;
  votes: Record<string, number>; // statement_id -> numeric vote (-1, 0, 1)
}

interface ClusteringConfig {
  pca_dimensions: number;
  consensus_threshold: number;
  min_group_size: number;
}

interface ClusterResult {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { poll_id, force_recalculate = false } = await req.json()
    
    if (!poll_id) {
      throw new Error('poll_id is required')
    }

    console.log(`Starting clustering for poll: ${poll_id}`)

    // Create clustering job
    const { data: job, error: jobError } = await supabase
      .from('polis_clustering_jobs')
      .insert({
        poll_id,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (jobError) throw jobError

    try {
      // Update poll clustering status
      await supabase
        .from('polis_polls')
        .update({
          clustering_status: 'running',
          last_clustering_job_id: job.job_id
        })
        .eq('poll_id', poll_id)

      // Check cache first (unless force recalculate)
      if (!force_recalculate) {
        const { data: cachedResult } = await supabase
          .from('polis_cluster_cache')
          .select('*')
          .eq('poll_id', poll_id)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (cachedResult) {
          console.log('Using cached clustering result')
          await updateJobStatus(supabase, job.job_id, 'completed', {
            processing_time_ms: 0,
            groups_created: cachedResult.cluster_results.groups?.length || 0,
            consensus_points_found: cachedResult.consensus_results.consensus_points?.length || 0
          })
          
          return new Response(JSON.stringify({
            success: true,
            cached: true,
            job_id: job.job_id,
            result: cachedResult
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      const startTime = Date.now()

      // Get poll configuration
      const { data: poll } = await supabase
        .from('polis_polls')
        .select('*')
        .eq('poll_id', poll_id)
        .single()

      if (!poll) throw new Error('Poll not found')

      const config: ClusteringConfig = poll.clustering_algorithm_config || {
        pca_dimensions: 2,
        consensus_threshold: 0.7,
        min_group_size: 2
      }

      // Load votes and statements
      const [votesResult, statementsResult] = await Promise.all([
        supabase
          .from('polis_votes')
          .select('session_id, statement_id, vote_value')
          .eq('poll_id', poll_id),
        supabase
          .from('polis_statements')
          .select('statement_id')
          .eq('poll_id', poll_id)
          .eq('is_approved', true)
      ])

      if (votesResult.error) throw votesResult.error
      if (statementsResult.error) throw statementsResult.error

      const votes: Vote[] = votesResult.data
      const statements = statementsResult.data
      const statementIds = statements.map(s => s.statement_id)

      console.log(`Processing ${votes.length} votes from ${new Set(votes.map(v => v.session_id)).size} participants on ${statementIds.length} statements`)

      // Build participant vote matrix
      const participants = buildVoteMatrix(votes, statementIds)
      
      if (participants.length < poll.clustering_min_participants) {
        throw new Error(`Not enough participants (${participants.length} < ${poll.clustering_min_participants})`)
      }

      // Perform advanced clustering with pol.is algorithm
      const clusterResult = await performAdvancedClustering(
        participants,
        statementIds,
        poll,
        config
      )

      // Store results in database
      await storeClusteringResults(supabase, poll_id, clusterResult, job.job_id)

      // Cache results
      const cacheKey = generateCacheKey(votes.length, participants.length)
      const cacheExpiry = new Date()
      cacheExpiry.setMinutes(cacheExpiry.getMinutes() + (poll.clustering_cache_ttl_minutes || 60))

      await supabase
        .from('polis_cluster_cache')
        .insert({
          poll_id,
          cache_key: cacheKey,
          vote_matrix: { participants: participants.length, votes: votes.length },
          cluster_results: { groups: clusterResult.groups },
          consensus_results: { consensus_points: clusterResult.consensus_points },
          opinion_space: clusterResult.opinion_space,
          participant_count: participants.length,
          vote_count: votes.length,
          expires_at: cacheExpiry.toISOString()
        })

      const processingTime = Date.now() - startTime

      // Update job as completed
      await updateJobStatus(supabase, job.job_id, 'completed', {
        processing_time_ms: processingTime,
        groups_created: clusterResult.groups.length,
        consensus_points_found: clusterResult.consensus_points.length,
        total_votes: votes.length,
        total_participants: participants.length
      })

      // Update poll status
      await supabase
        .from('polis_polls')
        .update({
          clustering_status: 'completed',
          last_clustered_at: new Date().toISOString()
        })
        .eq('poll_id', poll_id)

      console.log(`Clustering completed in ${processingTime}ms`)

      return new Response(JSON.stringify({
        success: true,
        job_id: job.job_id,
        processing_time_ms: processingTime,
        groups_created: clusterResult.groups.length,
        consensus_points_found: clusterResult.consensus_points.length,
        metrics: clusterResult.metrics
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Clustering error:', error)
      
      // Update job as failed
      await updateJobStatus(supabase, job.job_id, 'failed', {
        error_message: error.message
      })

      // Update poll status
      await supabase
        .from('polis_polls')
        .update({ clustering_status: 'failed' })
        .eq('poll_id', poll_id)

      throw error
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function buildVoteMatrix(votes: Vote[], statementIds: string[]): Participant[] {
  const participantMap = new Map<string, Participant>()

  // Initialize participants
  votes.forEach(vote => {
    if (!participantMap.has(vote.session_id)) {
      participantMap.set(vote.session_id, {
        session_id: vote.session_id,
        votes: {}
      })
    }
  })

  // Fill vote matrix
  votes.forEach(vote => {
    const participant = participantMap.get(vote.session_id)!
    participant.votes[vote.statement_id] = voteToNumeric(vote.vote_value)
  })

  // Fill missing votes with neutral (0) for now - could be improved with weighted averages
  const participants = Array.from(participantMap.values())
  participants.forEach(participant => {
    statementIds.forEach(statementId => {
      if (!(statementId in participant.votes)) {
        participant.votes[statementId] = 0 // neutral for missing votes
      }
    })
  })

  return participants
}

function voteToNumeric(vote: string): number {
  switch (vote) {
    case 'support': return 1
    case 'oppose': return -1
    case 'unsure': return 0
    default: return 0
  }
}

async function performAdvancedClustering(
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

  // Perform PCA-lite for dimensionality reduction
  const opinionSpace = performPCALite(matrix, participants.map(p => p.session_id))

  // Dynamic k-means clustering with optimal k selection
  const optimalK = findOptimalK(matrix, poll.clustering_min_groups, poll.clustering_max_groups)
  const clusters = performKMeansClustering(matrix, optimalK, config.min_group_size)

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
    poll.min_support_pct,
    poll.max_opposition_pct
  )

  // Calculate clustering metrics
  const metrics = calculateClusteringMetrics(matrix, clusters)

  return {
    groups,
    consensus_points: consensusPoints,
    opinion_space: opinionSpace,
    metrics
  }
}

function performPCALite(matrix: number[][], sessionIds: string[]): Record<string, [number, number]> {
  console.log('Performing PCA-lite for opinion space mapping')
  
  // Simplified PCA - calculate means and basic 2D projection
  const n = matrix.length
  const m = matrix[0].length
  
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

function findOptimalK(matrix: number[][], minK: number, maxK: number): number {
  console.log(`Finding optimal k between ${minK} and ${maxK}`)
  
  let bestK = minK
  let bestSilhouette = -1

  for (let k = minK; k <= Math.min(maxK, matrix.length - 1); k++) {
    const clusters = performKMeansClustering(matrix, k, 1)
    const avgSilhouette = clusters.reduce((sum, c) => sum + c.silhouette_score, 0) / clusters.length
    
    if (avgSilhouette > bestSilhouette) {
      bestSilhouette = avgSilhouette
      bestK = k
    }
  }

  console.log(`Optimal k: ${bestK} with silhouette score: ${bestSilhouette}`)
  return bestK
}

function performKMeansClustering(matrix: number[][], k: number, minGroupSize: number) {
  console.log(`Performing k-means clustering with k=${k}`)
  
  const n = matrix.length
  const m = matrix[0].length
  
  // Initialize centroids randomly
  let centroids = Array(k).fill(null).map(() => 
    Array(m).fill(0).map(() => Math.random() * 2 - 1)
  )
  
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
  
  return clusters
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}

function calculateSilhouetteScore(matrix: number[][], assignments: number[], clusterIndex: number): number {
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

function detectAdvancedConsensus(
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

function calculateClusteringMetrics(matrix: number[][], clusters: any[]): Record<string, number> {
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

async function storeClusteringResults(supabase: any, pollId: string, result: ClusterResult, jobId: string) {
  console.log('Storing clustering results in database')
  
  // Clear existing results
  await Promise.all([
    supabase.from('polis_user_group_membership').delete().eq('poll_id', pollId),
    supabase.from('polis_group_statement_stats').delete().eq('poll_id', pollId),
    supabase.from('polis_consensus_points').delete().eq('poll_id', pollId),
    supabase.from('polis_groups').delete().eq('poll_id', pollId)
  ])

  // Insert groups
  const { data: insertedGroups } = await supabase
    .from('polis_groups')
    .insert(result.groups.map(group => ({
      poll_id: pollId,
      algorithm: 'advanced-kmeans-v1',
      name: group.name,
      description: group.description,
      color: group.color,
      member_count: group.participants.length,
      cluster_center: group.center,
      silhouette_score: group.silhouette_score,
      opinion_space_coords: Object.fromEntries(
        group.participants.map(sessionId => [sessionId, result.opinion_space[sessionId]])
      )
    })))
    .select()

  // Insert group memberships
  if (insertedGroups) {
    const memberships = []
    for (let i = 0; i < result.groups.length; i++) {
      const group = result.groups[i]
      const dbGroup = insertedGroups[i]
      for (const sessionId of group.participants) {
        memberships.push({
          poll_id: pollId,
          group_id: dbGroup.group_id,
          session_id: sessionId
        })
      }
    }
    
    await supabase
      .from('polis_user_group_membership')
      .insert(memberships)
  }

  // Insert consensus points
  if (result.consensus_points.length > 0) {
    await supabase
      .from('polis_consensus_points')
      .insert(result.consensus_points.map(statementId => ({
        statement_id: statementId,
        poll_id: pollId
      })))
  }

  // Store metrics
  const metricInserts = Object.entries(result.metrics).map(([name, value]) => ({
    job_id: jobId,
    poll_id: pollId,
    metric_name: name,
    metric_value: value
  }))

  if (metricInserts.length > 0) {
    await supabase
      .from('polis_clustering_metrics')
      .insert(metricInserts)
  }
}

async function updateJobStatus(supabase: any, jobId: string, status: string, updates: any = {}) {
  await supabase
    .from('polis_clustering_jobs')
    .update({
      status,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null,
      ...updates
    })
    .eq('job_id', jobId)
}

function generateCacheKey(voteCount: number, participantCount: number): string {
  return `votes_${voteCount}_participants_${participantCount}_${Date.now()}`
}
