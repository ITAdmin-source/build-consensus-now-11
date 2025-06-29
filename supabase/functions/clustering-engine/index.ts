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

    console.log(`=== CLUSTERING START for poll: ${poll_id} ===`)
    console.log(`Force recalculate: ${force_recalculate}`)

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

    if (jobError) {
      console.error('Failed to create clustering job:', jobError)
      throw jobError
    }

    console.log(`Created clustering job: ${job.job_id}`)

    try {
      // Update poll clustering status
      await supabase
        .from('polis_polls')
        .update({
          clustering_status: 'running',
          last_clustering_job_id: job.job_id
        })
        .eq('poll_id', poll_id)

      const startTime = Date.now()

      // PHASE 1: PROPER VOTE COUNTING WITH DETAILED LOGGING
      console.log('=== PHASE 1: LOADING VOTES AND STATEMENTS ===')
      
      const [votesResult, statementsResult] = await Promise.all([
        supabase
          .from('polis_votes')
          .select('session_id, statement_id, vote_value, user_id')
          .eq('poll_id', poll_id),
        supabase
          .from('polis_statements')
          .select('statement_id')
          .eq('poll_id', poll_id)
          .eq('is_approved', true)
      ])

      if (votesResult.error) {
        console.error('Error loading votes:', votesResult.error)
        throw votesResult.error
      }
      if (statementsResult.error) {
        console.error('Error loading statements:', statementsResult.error)
        throw statementsResult.error
      }

      const votes: Vote[] = votesResult.data || []
      const statements = statementsResult.data || []
      const statementIds = statements.map(s => s.statement_id)

      console.log(`Raw vote data loaded: ${votes.length} votes`)
      console.log(`Approved statements: ${statementIds.length}`)
      console.log(`Sample votes:`, votes.slice(0, 3))

      // Count unique participants (prioritize session_id, fallback to user_id)
      const participantSet = new Set<string>()
      votes.forEach(vote => {
        const participantId = vote.session_id || vote.user_id?.toString() || 'anonymous'
        participantSet.add(participantId)
      })

      const participantCount = participantSet.size
      console.log(`Unique participants found: ${participantCount}`)
      console.log(`Participant IDs:`, Array.from(participantSet))

      // Update job with actual counts
      await supabase
        .from('polis_clustering_jobs')
        .update({
          total_votes: votes.length,
          total_participants: participantCount
        })
        .eq('job_id', job.job_id)

      // PHASE 2: IMPROVED CACHE LOGIC
      console.log('=== PHASE 2: CACHE VALIDATION ===')
      
      const cacheKey = `votes_${votes.length}_participants_${participantCount}_statements_${statementIds.length}`
      console.log(`Generated cache key: ${cacheKey}`)

      if (!force_recalculate) {
        const { data: cachedResult } = await supabase
          .from('polis_cluster_cache')
          .select('*')
          .eq('poll_id', poll_id)
          .gt('expires_at', new Date().toISOString())
          .eq('cache_key', cacheKey)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (cachedResult) {
          console.log('CACHE HIT: Using cached clustering result')
          await updateJobStatus(supabase, job.job_id, 'completed', {
            processing_time_ms: 0,
            groups_created: cachedResult.cluster_results.groups?.length || 0,
            consensus_points_found: cachedResult.consensus_results.consensus_points?.length || 0
          })
          
          return new Response(JSON.stringify({
            success: true,
            cached: true,
            job_id: job.job_id,
            result: cachedResult,
            debug: {
              votes_loaded: votes.length,
              participants_found: participantCount,
              cache_key: cacheKey
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          console.log('CACHE MISS: No valid cache found, proceeding with clustering')
        }
      } else {
        console.log('CACHE BYPASS: Force recalculate requested')
      }

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

      console.log('Clustering config:', config)

      // Check minimum participants requirement
      const minParticipants = poll.clustering_min_participants || 2
      if (participantCount < minParticipants) {
        console.log(`Insufficient participants: ${participantCount} < ${minParticipants}`)
        throw new Error(`Not enough participants (${participantCount} < ${minParticipants})`)
      }

      // PHASE 3: FIXED VOTE MATRIX GENERATION
      console.log('=== PHASE 3: BUILDING VOTE MATRIX ===')
      
      const participants = buildVoteMatrix(votes, statementIds)
      console.log(`Vote matrix built with ${participants.length} participants`)
      console.log(`Sample participant votes:`, participants[0]?.votes)
      
      if (participants.length === 0) {
        throw new Error('No valid participants found after matrix generation')
      }

      // PHASE 4: CLUSTERING WITH DETAILED LOGGING
      console.log('=== PHASE 4: PERFORMING CLUSTERING ===')
      
      const clusterResult = await performAdvancedClustering(
        participants,
        statementIds,
        poll,
        config
      )

      console.log(`Clustering completed: ${clusterResult.groups.length} groups created`)
      clusterResult.groups.forEach((group, i) => {
        console.log(`Group ${i + 1}: ${group.participants.length} participants`)
      })

      // PHASE 5: STORE RESULTS WITH VERIFICATION
      console.log('=== PHASE 5: STORING RESULTS ===')
      
      await storeClusteringResults(supabase, poll_id, clusterResult, participants, votes, statementIds, job.job_id)

      // Verify stored results
      const { data: verifyGroups } = await supabase
        .from('polis_groups')
        .select('group_id, member_count')
        .eq('poll_id', poll_id)

      console.log('Verification - Groups stored:', verifyGroups?.length || 0)
      verifyGroups?.forEach(g => console.log(`- Group ${g.group_id}: ${g.member_count} members`))

      // Cache results with improved key
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
          participant_count: participantCount,
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
        total_participants: participantCount
      })

      // Update poll status
      await supabase
        .from('polis_polls')
        .update({
          clustering_status: 'completed',
          last_clustered_at: new Date().toISOString()
        })
        .eq('poll_id', poll_id)

      console.log(`=== CLUSTERING COMPLETED in ${processingTime}ms ===`)

      return new Response(JSON.stringify({
        success: true,
        job_id: job.job_id,
        processing_time_ms: processingTime,
        groups_created: clusterResult.groups.length,
        consensus_points_found: clusterResult.consensus_points.length,
        metrics: clusterResult.metrics,
        debug: {
          votes_loaded: votes.length,
          participants_found: participantCount,
          statements_count: statementIds.length,
          cache_key: cacheKey
        }
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
  console.log('Building vote matrix...')
  const participantMap = new Map<string, Participant>()

  // Initialize participants with proper ID handling
  votes.forEach(vote => {
    const participantId = vote.session_id || 'anonymous'
    if (!participantMap.has(participantId)) {
      participantMap.set(participantId, {
        session_id: participantId,
        votes: {}
      })
    }
  })

  console.log(`Initialized ${participantMap.size} participants`)

  // Fill vote matrix
  votes.forEach(vote => {
    const participantId = vote.session_id || 'anonymous'
    const participant = participantMap.get(participantId)!
    participant.votes[vote.statement_id] = voteToNumeric(vote.vote_value)
  })

  // Fill missing votes with neutral (0)
  const participants = Array.from(participantMap.values())
  participants.forEach(participant => {
    statementIds.forEach(statementId => {
      if (!(statementId in participant.votes)) {
        participant.votes[statementId] = 0 // neutral for missing votes
      }
    })
  })

  console.log(`Vote matrix completed with ${participants.length} participants and ${statementIds.length} statements`)
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

  console.log(`Matrix dimensions: ${matrix.length} x ${matrix[0]?.length || 0}`)

  // Perform PCA-lite for dimensionality reduction
  const opinionSpace = performPCALite(matrix, participants.map(p => p.session_id))

  // Dynamic k-means clustering with optimal k selection
  const minK = poll.clustering_min_groups || 2
  const maxK = Math.min(poll.clustering_max_groups || 5, participants.length - 1)
  const optimalK = findOptimalK(matrix, minK, maxK)
  
  console.log(`Optimal k selected: ${optimalK} (range: ${minK}-${maxK})`)
  
  const clusters = performKMeansClustering(matrix, optimalK, config.min_group_size)

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

function performPCALite(matrix: number[][], sessionIds: string[]): Record<string, [number, number]> {
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

function findOptimalK(matrix: number[][], minK: number, maxK: number): number {
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

/** K-means++ centroid initialization */
function initializeCentroidsPlusPlus(matrix: number[][], k: number): number[][] {
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


function performKMeansClustering(matrix: number[][], k: number, minGroupSize: number) {
  console.log(`Performing k-means clustering with k=${k}`)
  
  const n = matrix.length
  const m = matrix[0]?.length || 0
  
  if (n === 0 || m === 0) {
    console.warn('Cannot cluster empty matrix')
    return []
  }

  {/*
  // Initialize centroids randomly
  let centroids = Array(k).fill(null).map(() => 
    Array(m).fill(0).map(() => Math.random() * 2 - 1)
  )*/}

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

async function storeClusteringResults(supabase: any, pollId: string, result: ClusterResult, participants: Participant[], votes: Vote[], statementIds: string[], jobId: string) {
  console.log('Storing clustering results in database')
  
  // Clear existing results
  await Promise.all([
    supabase.from('polis_user_group_membership').delete().eq('poll_id', pollId),
    supabase.from('polis_group_statement_stats').delete().eq('poll_id', pollId),
    supabase.from('polis_consensus_points').delete().eq('poll_id', pollId),
    supabase.from('polis_groups').delete().eq('poll_id', pollId)
  ])

  console.log('Cleared existing clustering data')

  // Insert groups
  const { data: insertedGroups } = await supabase
    .from('polis_groups')
    .insert(result.groups.map(group => ({
      poll_id: pollId,
      algorithm: 'advanced-kmeans-v2',
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

  console.log(`Inserted ${insertedGroups?.length || 0} groups`)

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
    
    const { error: membershipError } = await supabase
      .from('polis_user_group_membership')
      .insert(memberships)

    if (membershipError) {
      console.error('Error inserting memberships:', membershipError)
    } else {
      console.log(`Inserted ${memberships.length} group memberships`)
    }

    // Calculate and insert group statement statistics
    console.log('=== CALCULATING GROUP STATEMENT STATISTICS ===')
    const groupStatistics = calculateGroupStatementStats(insertedGroups, votes, statementIds, participants)
    
    if (groupStatistics.length > 0) {
      const { error: statsError } = await supabase
        .from('polis_group_statement_stats')
        .insert(groupStatistics)

      if (statsError) {
        console.error('Error inserting group statement stats:', statsError)
      } else {
        console.log(`Inserted ${groupStatistics.length} group statement statistics`)
      }
    }
  }

  // Insert consensus points
  if (result.consensus_points.length > 0) {
    const { error: consensusError } = await supabase
      .from('polis_consensus_points')
      .insert(result.consensus_points.map(statementId => ({
        statement_id: statementId,
        poll_id: pollId
      })))

    if (consensusError) {
      console.error('Error inserting consensus points:', consensusError)
    } else {
      console.log(`Inserted ${result.consensus_points.length} consensus points`)
    }
  }

  // Store metrics
  const metricInserts = Object.entries(result.metrics).map(([name, value]) => ({
    job_id: jobId,
    poll_id: pollId,
    metric_name: name,
    metric_value: value
  }))

  if (metricInserts.length > 0) {
    const { error: metricsError } = await supabase
      .from('polis_clustering_metrics')
      .insert(metricInserts)

    if (metricsError) {
      console.error('Error storing metrics:', metricsError)
    } else {
      console.log(`Stored ${metricInserts.length} clustering metrics`)
    }
  }

  console.log('Clustering results storage completed')
}

function calculateGroupStatementStats(groups: any[], votes: Vote[], statementIds: string[], participants: Participant[]): any[] {
  console.log('Calculating group statement statistics...')
  const statistics = []
  
  // Create a mapping from session_id to group_id
  const sessionToGroup = new Map<string, string>()
  groups.forEach(group => {
    const groupMembers = group.opinion_space_coords ? Object.keys(group.opinion_space_coords) : []
    groupMembers.forEach(sessionId => {
      sessionToGroup.set(sessionId, group.group_id)
    })
  })

  // For each group and statement, calculate voting statistics
  for (const group of groups) {
    for (const statementId of statementIds) {
      // Get all votes for this statement from group members
      const groupVotes = votes.filter(vote => 
        vote.statement_id === statementId && 
        sessionToGroup.get(vote.session_id || 'anonymous') === group.group_id
      )

      if (groupVotes.length === 0) continue

      const supportCount = groupVotes.filter(v => v.vote_value === 'support').length
      const opposeCount = groupVotes.filter(v => v.vote_value === 'oppose').length
      const unsureCount = groupVotes.filter(v => v.vote_value === 'unsure').length
      const totalVotes = groupVotes.length

      const supportPct = (supportCount / totalVotes) * 100
      const opposePct = (opposeCount / totalVotes) * 100
      const unsurePct = (unsureCount / totalVotes) * 100

      statistics.push({
        group_id: group.group_id,
        statement_id: statementId,
        poll_id: group.poll_id,
        support_pct: supportPct,
        oppose_pct: opposePct,
        unsure_pct: unsurePct,
        total_votes: totalVotes
      })

      console.log(`Group ${group.name} on statement ${statementId.slice(0, 8)}: ${supportPct.toFixed(1)}% support, ${opposePct.toFixed(1)}% oppose, ${unsurePct.toFixed(1)}% unsure (${totalVotes} votes)`)
    }
  }
  
  console.log(`Calculated statistics for ${statistics.length} group-statement combinations`)
  return statistics
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
