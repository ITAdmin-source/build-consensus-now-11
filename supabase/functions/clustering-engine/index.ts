import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.168.0/hash/mod.ts'

// ── ENV & SUPABASE CLIENT ──
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Vote {
  session_id: string
  statement_id: string
  vote_value: 'support' | 'oppose' | 'unsure'
  user_id?: number
}

interface Participant {
  session_id: string
  votes: Record<string, number>
}

interface ClusteringConfig {
  pca_dimensions: number
  consensus_threshold: number
  min_group_size: number
}

interface ClusterResult {
  groups: Array<{
    group_id: string
    participants: string[]
    center: number[]
    silhouette_score: number
    name: string
    description: string
    color: string
  }>
  consensus_points: string[]
  opinion_space: Record<string, [number, number]>
  metrics: Record<string, number>
}

interface PollRecord {
  poll_id: string
  clustering_min_participants: number
  clustering_min_groups: number
  clustering_max_groups: number
  clustering_algorithm_config: ClusteringConfig
  clustering_cache_ttl_minutes: number
  min_support_pct: number
  max_opposition_pct: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { poll_id, force_recalculate = false } = await req.json()
    if (!poll_id) throw new Error('poll_id is required')

    console.log(`=== CLUSTERING START for poll: ${poll_id} ===`)

    // Create job
    const { data: job, error: jobError } = await supabase
      .from('polis_clustering_jobs')
      .insert({
        poll_id,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (jobError) throw jobError

    // Update poll status
    await supabase
      .from('polis_polls')
      .update({
        clustering_status: 'running',
        last_clustering_job_id: job.job_id,
      })
      .eq('poll_id', poll_id)

    // PHASE 1: Load votes & statements
    console.log('=== PHASE 1: LOADING VOTES AND STATEMENTS ===')
    const [votesResult, statementsResult] = await Promise.all([
      supabase
        .from<Vote>('polis_votes')
        .select('session_id, statement_id, vote_value, user_id')
        .eq('poll_id', poll_id),
      supabase
        .from('polis_statements')
        .select('statement_id')
        .eq('poll_id', poll_id)
        .eq('is_approved', true),
    ])
    if (votesResult.error) throw votesResult.error
    if (statementsResult.error) throw statementsResult.error

    const votes = votesResult.data || []
    const statementIds = (statementsResult.data || []).map(s => s.statement_id)

    // Count participants
    const participantSet = new Set<string>()
    votes.forEach(v => {
      const pid = v.session_id || v.user_id?.toString() || 'anonymous'
      participantSet.add(pid)
    })
    const participantCount = participantSet.size

    // Update job counts
    await supabase
      .from('polis_clustering_jobs')
      .update({
        total_votes: votes.length,
        total_participants: participantCount,
      })
      .eq('job_id', job.job_id)

    // PHASE 2: Cache validation with MD5 key
    console.log('=== PHASE 2: CACHE VALIDATION ===')
    const voteString = votes
      .map(v => `${v.session_id}|${v.statement_id}|${v.vote_value}`)
      .sort()
      .join('\n')
    const digest = createHash('md5').update(voteString).toString()
    const cacheKey = `votes_md5_${digest}`

    if (!force_recalculate) {
      const { data: cached } = await supabase
        .from('polis_cluster_cache')
        .select('*')
        .eq('poll_id', poll_id)
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (cached) {
        console.log('CACHE HIT')
        // mark complete
        await updateJobStatus(supabase, job.job_id, 'completed', {
          processing_time_ms: 0,
          groups_created: cached.cluster_results.groups?.length || 0,
          consensus_points_found:
            cached.consensus_results.consensus_points?.length || 0,
        })
        return new Response(
          JSON.stringify({ success: true, cached: true, result: cached }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      console.log('CACHE MISS')
    } else {
      console.log('FORCE RECALCULATE')
    }

    // Load poll config
    const { data: poll } = await supabase
      .from<PollRecord>('polis_polls')
      .select('*')
      .eq('poll_id', poll_id)
      .single()
    if (!poll) throw new Error('Poll not found')
    const config = poll.clustering_algorithm_config

    if (participantCount < poll.clustering_min_participants) {
      throw new Error(
        `Not enough participants (${participantCount} < ${poll.clustering_min_participants})`
      )
    }

    // PHASE 3: Build vote matrix
    console.log('=== PHASE 3: BUILDING VOTE MATRIX ===')
    const participants = buildVoteMatrix(votes, statementIds)
    if (participants.length === 0) {
      throw new Error('No valid participants')
    }

    // PHASE 4: Clustering
    console.log('=== PHASE 4: PERFORMING CLUSTERING ===')
    const clusterResult = await performAdvancedClustering(
      participants,
      statementIds,
      poll,
      config
    )

    // PHASE 5: Store results
    console.log('=== PHASE 5: STORING RESULTS ===')
    await storeClusteringResults(
      supabase,
      poll_id,
      clusterResult,
      participants,
      votes,
      statementIds,
      job.job_id
    )

    // Cache new result
    const expires = new Date()
    expires.setMinutes(expires.getMinutes() + poll.clustering_cache_ttl_minutes)
    await supabase.from('polis_cluster_cache').insert({
      poll_id,
      cache_key: cacheKey,
      vote_matrix: { participants: participants.length, votes: votes.length },
      cluster_results: { groups: clusterResult.groups },
      consensus_results: { consensus_points: clusterResult.consensus_points },
      opinion_space: clusterResult.opinion_space,
      participant_count: participantCount,
      vote_count: votes.length,
      expires_at: expires.toISOString(),
    })

    const processingTime = Date.now() - job.started_at.valueOf()
    await updateJobStatus(supabase, job.job_id, 'completed', {
      processing_time_ms: processingTime,
      groups_created: clusterResult.groups.length,
      consensus_points_found: clusterResult.consensus_points.length,
    })
    await supabase
      .from('polis_polls')
      .update({
        clustering_status: 'completed',
        last_clustered_at: new Date().toISOString(),
      })
      .eq('poll_id', poll_id)

    return new Response(
      JSON.stringify({
        success: true,
        job_id: job.job_id,
        processing_time_ms: processingTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


// ── MATRIX BUILDER ──
function buildVoteMatrix(votes: Vote[], statementIds: string[]): Participant[] {
  console.log('Building vote matrix...')
  const map = new Map<string, Participant>()
  votes.forEach(v => {
    const pid = v.session_id || v.user_id?.toString() || 'anonymous'
    if (!map.has(pid)) map.set(pid, { session_id: pid, votes: {} })
  })
  map.forEach((p, _) => {
    statementIds.forEach(sid => (p.votes[sid] = 0))
  })
  votes.forEach(v => {
    const pid = v.session_id || v.user_id?.toString() || 'anonymous'
    map.get(pid)!.votes[v.statement_id] = voteToNumeric(v.vote_value)
  })
  return Array.from(map.values())
}

function voteToNumeric(v: string) {
  return v === 'support' ? 1 : v === 'oppose' ? -1 : 0
}


// ── CLUSTERING HELPERS ──
async function performAdvancedClustering(
  participants: Participant[],
  statementIds: string[],
  poll: PollRecord,
  config: ClusteringConfig
): Promise<ClusterResult> {
  const matrix = participants.map(p =>
    statementIds.map(sid => p.votes[sid])
  )

  // PCA-lite (unchanged)
  const opinionSpace = performPCALite(matrix, participants.map(p => p.session_id))

  // find k
  const minK = poll.clustering_min_groups
  const maxK = Math.min(poll.clustering_max_groups, participants.length - 1)
  const optimalK = findOptimalK(matrix, minK, maxK)

  // k-means++ clustering
  const rawClusters = performKMeansClustering(matrix, optimalK, config.min_group_size)

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
  const groups = rawClusters.map((c, i) => ({
    group_id: `group_${i + 1}`,
    participants: c.participants.map(idx => participants[idx].session_id),
    center: c.center,
    silhouette_score: c.silhouette_score,
    name: `קבוצה ${i + 1}`,
    description: `קבוצת דעות עם ${c.participants.length} משתתפים`,
    color: colors[i % colors.length],
  }))

  const consensus = detectAdvancedConsensus(
    matrix,
    rawClusters,
    statementIds,
    config.consensus_threshold,
    poll.min_support_pct,
    poll.max_opposition_pct
  )
  const metrics = calculateClusteringMetrics(matrix, rawClusters)

  return { groups, consensus_points: consensus, opinion_space: opinionSpace, metrics }
}

function performPCALite(
  matrix: number[][],
  sessionIds: string[]
): Record<string, [number, number]> {
  const n = matrix.length
  const m = matrix[0]?.length || 0
  const means = Array(m).fill(0)
  for (let j = 0; j < m; j++)
    for (let i = 0; i < n; i++) means[j] += matrix[i][j]
  for (let j = 0; j < m; j++) means[j] /= n
  const centered = matrix.map(r => r.map((v, j) => v - means[j]))
  const out: Record<string, [number, number]> = {}
  centered.forEach((row, i) => {
    const x = row.reduce((s, v, j) => s + v * (j % 2 === 0 ? 1 : -1), 0) / m
    const y = row.reduce((s, v, j) => s + v * (j % 3 === 0 ? 1 : -1), 0) / m
    out[sessionIds[i]] = [x, y]
  })
  return out
}

function findOptimalK(
  matrix: number[][],
  minK: number,
  maxK: number
): number {
  let bestK = minK,
    bestScore = -Infinity
  for (let k = minK; k <= Math.min(maxK, matrix.length - 1); k++) {
    const clusters = performKMeansClustering(matrix, k, 1)
    if (clusters.length === 0) continue
    const avgSil = clusters.reduce((s, c) => s + c.silhouette_score, 0) /
      clusters.length
    if (avgSil > bestScore) {
      bestScore = avgSil
      bestK = k
    }
  }
  return bestK
}

function initializeCentroidsPlusPlus(
  matrix: number[][],
  k: number
): number[][] {
  const centroids: number[][] = []
  centroids.push(matrix[Math.floor(Math.random() * matrix.length)])
  while (centroids.length < k) {
    const dists = matrix.map(pt =>
      Math.min(...centroids.map(c => euclideanDistance(pt, c))) ** 2
    )
    const sum = dists.reduce((a, b) => a + b, 0)
    let r = Math.random() * sum
    for (let i = 0; i < matrix.length; i++) {
      r -= dists[i]
      if (r <= 0) {
        centroids.push(matrix[i])
        break
      }
    }
  }
  return centroids
}

function performKMeansClustering(
  matrix: number[][],
  k: number,
  minSize: number
) {
  const n = matrix.length
  if (n === 0) return []
  const m = matrix[0].length
  let centroids = initializeCentroidsPlusPlus(matrix, k)
  let assignments = new Array(n).fill(0)

  for (let it = 0; it < 100; it++) {
    const newAssign = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      let best = 0,
        minD = Infinity
      for (let j = 0; j < k; j++) {
        const d = euclideanDistance(matrix[i], centroids[j])
        if (d < minD) (minD = d), (best = j)
      }
      newAssign[i] = best
    }
    if (newAssign.every((v, i) => v === assignments[i])) break
    assignments = newAssign
    for (let j = 0; j < k; j++) {
      const pts = matrix.filter((_, i) => assignments[i] === j)
      if (pts.length) {
        centroids[j] = []
        for (let col = 0; col < m; col++) {
          centroids[j][col] =
            pts.reduce((s, p) => s + p[col], 0) / pts.length
        }
      }
    }
  }

  const clusters = Array.from({ length: k }, (_, j) => {
    const members = assignments
      .map((c, i) => (c === j ? i : -1))
      .filter(i => i >= 0)
    return {
      participants: members,
      center: centroids[j],
      silhouette_score: calculateSilhouetteScore(matrix, assignments, j),
    }
  }).filter(c => c.participants.length >= minSize)

  return clusters
}

function euclideanDistance(a: number[], b: number[]) {
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
}

function calculateSilhouetteScore(
  matrix: number[][],
  assignments: number[],
  idx: number
) {
  const members = assignments
    .map((c, i) => (c === idx ? i : -1))
    .filter(i => i >= 0)
  if (members.length < 2) return 0
  let total = 0
  for (const i of members) {
    // a = avg dist to same cluster
    const a =
      members
        .filter(x => x !== i)
        .reduce((s, x) => s + euclideanDistance(matrix[i], matrix[x]), 0) /
      (members.length - 1)
    // b = min avg dist to other clusters
    let b = Infinity
    const others = [...new Set(assignments)].filter(c => c !== idx)
    for (const c of others) {
      const pts = assignments
        .map((cl, ii) => (cl === c ? ii : -1))
        .filter(ii => ii >= 0)
      const avg = pts.reduce((s, x) => s + euclideanDistance(matrix[i], matrix[x]), 0) / pts.length
      b = Math.min(b, avg)
    }
    total += (b - a) / Math.max(a, b)
  }
  return total / members.length
}


// ── CONSENSUS & METRICS ──
function detectAdvancedConsensus(
  matrix: number[][],
  clusters: any[],
  statementIds: string[],
  threshold: number,
  minSupport: number,
  maxOppose: number
): string[] {
  const result: string[] = []
  for (let si = 0; si < statementIds.length; si++) {
    let ok = true,
      sup = 0,
      opp = 0,
      tot = 0
    for (const cl of clusters) {
      const votes = cl.participants.map((p: number) => matrix[p][si])
      const s = votes.filter(v => v === 1).length
      const o = votes.filter(v => v === -1).length
      const t = votes.length
      if ((s / t) * 100 < minSupport || (o / t) * 100 > maxOppose) {
        ok = false
        break
      }
      sup += s
      opp += o
      tot += t
    }
    if (ok && tot > 0) {
      if ((sup / tot) * 100 >= threshold * 100 && (opp / tot) * 100 <= (1 - threshold) * 100) {
        result.push(statementIds[si])
      }
    }
  }
  return result
}

function calculateClusteringMetrics(matrix: number[][], clusters: any[]) {
  const avgSil =
    clusters.reduce((s, c) => s + c.silhouette_score, 0) / clusters.length
  const sizes = clusters.map(c => c.participants.length)
  const meanSize = sizes.reduce((s, v) => s + v, 0) / sizes.length
  const variance =
    sizes.reduce((s, v) => s + (v - meanSize) ** 2, 0) / sizes.length
  return {
    silhouette_score: avgSil,
    cluster_balance: 1 / (1 + variance),
    total_clusters: clusters.length,
    avg_cluster_size: meanSize,
  }
}


// ── STORAGE HELPERS ──
async function storeClusteringResults(
  supabase: any,
  pollId: string,
  result: ClusterResult,
  participants: Participant[],
  votes: Vote[],
  statementIds: string[],
  jobId: string
) {
  // delete & re-insert exactly as before
  await Promise.all([
    supabase.from('polis_user_group_membership').delete().eq('poll_id', pollId),
    supabase.from('polis_group_statement_stats').delete().eq('poll_id', pollId),
    supabase.from('polis_consensus_points').delete().eq('poll_id', pollId),
    supabase.from('polis_groups').delete().eq('poll_id', pollId),
  ])

  const { data: insertedGroups } = await supabase
    .from('polis_groups')
    .insert(
      result.groups.map(g => ({
        poll_id: pollId,
        algorithm: 'advanced-kmeans-v2',
        name: g.name,
        description: g.description,
        color: g.color,
        member_count: g.participants.length,
        cluster_center: g.center,
        silhouette_score: g.silhouette_score,
        opinion_space_coords: Object.fromEntries(
          g.participants.map(sid => [sid, result.opinion_space[sid]])
        ),
      }))
    )
    .select()

  if (insertedGroups) {
    const memberships = insertedGroups.flatMap((grp, i) =>
      result.groups[i].participants.map(sid => ({
        poll_id: pollId,
        group_id: grp.group_id,
        session_id: sid,
      }))
    )
    await supabase
      .from('polis_user_group_membership')
      .insert(memberships)

    const stats = calculateGroupStatementStats(
      insertedGroups,
      votes,
      statementIds,
      participants
    )
    if (stats.length) {
      await supabase
        .from('polis_group_statement_stats')
        .insert(stats)
    }
  }

  if (result.consensus_points.length) {
    await supabase
      .from('polis_consensus_points')
      .insert(
        result.consensus_points.map(sid => ({
          statement_id: sid,
          poll_id: pollId,
        }))
      )
  }

  const metricInserts = Object.entries(result.metrics).map(([name, val]) => ({
    job_id: jobId,
    poll_id: pollId,
    metric_name: name,
    metric_value: val,
  }))
  if (metricInserts.length) {
    await supabase
      .from('polis_clustering_metrics')
      .insert(metricInserts)
  }
}

function calculateGroupStatementStats(
  groups: any[],
  votes: Vote[],
  statementIds: string[],
  participants: Participant[]
) {
  const sessionToGroup = new Map<string, string>()
  groups.forEach(g => {
    const coords = g.opinion_space_coords || {}
    Object.keys(coords).forEach((sid: string) =>
      sessionToGroup.set(sid, g.group_id)
    )
  })

  const stats: any[] = []
  for (const g of groups) {
    for (const sid of statementIds) {
      const gv = votes.filter(
        v => v.statement_id === sid && sessionToGroup.get(v.session_id || '') === g.group_id
      )
      if (!gv.length) continue
      const s = gv.filter(v => v.vote_value === 'support').length
      const o = gv.filter(v => v.vote_value === 'oppose').length
      const u = gv.filter(v => v.vote_value === 'unsure').length
      const t = gv.length
      stats.push({
        group_id: g.group_id,
        statement_id: sid,
        poll_id: g.poll_id,
        support_pct: (s / t) * 100,
        oppose_pct: (o / t) * 100,
        unsure_pct: (u / t) * 100,
        total_votes: t,
      })
    }
  }
  return stats
}

async function updateJobStatus(
  supabase: any,
  jobId: string,
  status: string,
  updates: Record<string, unknown> = {}
) {
  await supabase
    .from('polis_clustering_jobs')
    .update({
      status,
      completed_at:
        status === 'completed' || status === 'failed'
          ? new Date().toISOString()
          : null,
      ...updates,
    })
    .eq('job_id', jobId)
}
