
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'
import { Vote, Participant, ClusteringConfig } from './types.ts'
import { buildVoteMatrix } from './vote-matrix.ts'
import { performAdvancedClustering } from './clustering.ts'
import { storeClusteringResults } from './storage.ts'
import { updateJobStatus } from './utils.ts'

// ── MODULE-SCOPE Supabase CLIENT ──
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      
      // build an MD5 key based on every vote record
      const voteString = votes
        .map(v => `${v.session_id}|${v.statement_id}|${v.vote_value}`)
        .sort()
        .join('\\n')
      
      // Use Deno's built-in crypto API for MD5
      const encoder = new TextEncoder()
      const data = encoder.encode(voteString)
      const hashBuffer = await crypto.subtle.digest('MD5', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      const cacheKey = `votes_md5_${digest}`
      console.log(`Generated cache key (MD5): ${cacheKey}`)
      
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
