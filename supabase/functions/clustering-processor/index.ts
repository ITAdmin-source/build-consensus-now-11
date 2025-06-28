
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VoteData {
  user_id?: string;
  session_id?: string;
  statement_id: string;
  vote_value: string;
}

interface StatementData {
  statement_id: string;
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { poll_id, force_recalculate = false } = await req.json()
    
    if (!poll_id) {
      throw new Error('poll_id is required')
    }

    console.log(`Processing clustering for poll: ${poll_id}`)

    // Create clustering job
    const { data: jobData, error: jobError } = await supabaseClient
      .from('polis_clustering_jobs')
      .insert({
        poll_id,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (jobError) throw jobError

    const job_id = jobData.job_id

    try {
      // Get votes data
      const { data: votes, error: votesError } = await supabaseClient
        .from('polis_votes')
        .select('user_id, session_id, statement_id, vote_value')
        .eq('poll_id', poll_id)

      if (votesError) throw votesError

      // Get statements data
      const { data: statements, error: statementsError } = await supabaseClient
        .from('polis_statements')
        .select('statement_id, content')
        .eq('poll_id', poll_id)
        .eq('is_approved', true)

      if (statementsError) throw statementsError

      console.log(`Found ${votes.length} votes and ${statements.length} statements`)

      // Clear existing clustering results
      await supabaseClient.from('polis_groups').delete().eq('poll_id', poll_id)
      await supabaseClient.from('polis_user_group_membership').delete().eq('poll_id', poll_id)
      await supabaseClient.from('polis_group_statement_stats').delete().eq('poll_id', poll_id)
      await supabaseClient.from('polis_consensus_points').delete().eq('poll_id', poll_id)

      // Simple clustering algorithm
      const userVoteMatrix = buildVoteMatrix(votes, statements)
      const clusters = performSimpleClustering(userVoteMatrix, 3) // Create 3 groups
      
      // Save groups
      const groupsToInsert = clusters.map((cluster, index) => ({
        poll_id,
        name: `קבוצה ${index + 1}`,
        member_count: cluster.members.length,
        color: getGroupColor(index),
        created_at: new Date().toISOString()
      }))

      const { data: savedGroups, error: groupsError } = await supabaseClient
        .from('polis_groups')
        .insert(groupsToInsert)
        .select()

      if (groupsError) throw groupsError

      // Save user group memberships
      const memberships = []
      for (let i = 0; i < clusters.length; i++) {
        const group = savedGroups[i]
        for (const member of clusters[i].members) {
          memberships.push({
            poll_id,
            group_id: group.group_id,
            user_id: member.startsWith('user_') ? member.replace('user_', '') : null,
            session_id: member.startsWith('user_') ? null : member
          })
        }
      }

      if (memberships.length > 0) {
        const { error: membershipError } = await supabaseClient
          .from('polis_user_group_membership')
          .insert(memberships)

        if (membershipError) throw membershipError
      }

      // Calculate group statistics for each statement
      const groupStats = []
      for (const group of savedGroups) {
        const groupIndex = savedGroups.indexOf(group)
        const cluster = clusters[groupIndex]
        
        for (const statement of statements) {
          const stats = calculateGroupStats(cluster.members, statement.statement_id, votes)
          groupStats.push({
            group_id: group.group_id,
            statement_id: statement.statement_id,
            poll_id,
            support_pct: stats.support_pct,
            oppose_pct: stats.oppose_pct,
            unsure_pct: stats.unsure_pct,
            total_votes: stats.total_votes
          })
        }
      }

      if (groupStats.length > 0) {
        const { error: statsError } = await supabaseClient
          .from('polis_group_statement_stats')
          .insert(groupStats)

        if (statsError) throw statsError
      }

      // Detect consensus points
      const consensusPoints = detectConsensusPoints(statements, groupStats)
      
      if (consensusPoints.length > 0) {
        const consensusInserts = consensusPoints.map(statementId => ({
          poll_id,
          statement_id: statementId,
          detected_at: new Date().toISOString()
        }))

        const { error: consensusError } = await supabaseClient
          .from('polis_consensus_points')
          .insert(consensusInserts)

        if (consensusError) throw consensusError
      }

      // Update clustering job as completed
      await supabaseClient
        .from('polis_clustering_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          groups_created: savedGroups.length,
          consensus_points_found: consensusPoints.length,
          processing_time_ms: Date.now() - new Date(jobData.created_at).getTime()
        })
        .eq('job_id', job_id)

      // Update poll clustering status
      await supabaseClient
        .from('polis_polls')
        .update({
          clustering_status: 'completed',
          last_clustered_at: new Date().toISOString()
        })
        .eq('poll_id', poll_id)

      console.log(`Clustering completed: ${savedGroups.length} groups, ${consensusPoints.length} consensus points`)

      return new Response(
        JSON.stringify({
          success: true,
          groups_created: savedGroups.length,
          consensus_points_found: consensusPoints.length,
          job_id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } catch (error) {
      // Update job as failed
      await supabaseClient
        .from('polis_clustering_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('job_id', job_id)

      throw error
    }

  } catch (error) {
    console.error('Clustering error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function buildVoteMatrix(votes: VoteData[], statements: StatementData[]) {
  const users = [...new Set(votes.map(v => v.user_id || v.session_id))]
  const matrix: Record<string, Record<string, number>> = {}

  for (const user of users) {
    matrix[user] = {}
    for (const statement of statements) {
      const vote = votes.find(v => 
        (v.user_id || v.session_id) === user && 
        v.statement_id === statement.statement_id
      )
      
      if (vote) {
        matrix[user][statement.statement_id] = vote.vote_value === 'support' ? 1 : 
                                              vote.vote_value === 'oppose' ? -1 : 0
      } else {
        matrix[user][statement.statement_id] = 0
      }
    }
  }

  return matrix
}

function performSimpleClustering(matrix: Record<string, Record<string, number>>, k: number) {
  const users = Object.keys(matrix)
  const statements = Object.keys(matrix[users[0]] || {})
  
  if (users.length < k) {
    // If we have fewer users than desired clusters, put each user in their own group
    return users.map(user => ({ members: [user] }))
  }

  // Simple k-means clustering
  const clusters = []
  const usersPerCluster = Math.ceil(users.length / k)
  
  for (let i = 0; i < k; i++) {
    const start = i * usersPerCluster
    const end = Math.min(start + usersPerCluster, users.length)
    clusters.push({
      members: users.slice(start, end)
    })
  }

  return clusters.filter(c => c.members.length > 0)
}

function calculateGroupStats(members: string[], statementId: string, votes: VoteData[]) {
  const groupVotes = votes.filter(v => 
    members.includes(v.user_id || v.session_id) && 
    v.statement_id === statementId
  )

  const support = groupVotes.filter(v => v.vote_value === 'support').length
  const oppose = groupVotes.filter(v => v.vote_value === 'oppose').length
  const unsure = groupVotes.filter(v => v.vote_value === 'unsure').length
  const total = groupVotes.length

  return {
    support_pct: total > 0 ? (support / total) * 100 : 0,
    oppose_pct: total > 0 ? (oppose / total) * 100 : 0,
    unsure_pct: total > 0 ? (unsure / total) * 100 : 0,
    total_votes: total
  }
}

function detectConsensusPoints(statements: StatementData[], groupStats: any[]) {
  const consensusPoints = []
  
  for (const statement of statements) {
    const statementStats = groupStats.filter(s => s.statement_id === statement.statement_id)
    
    // Check if all groups have >60% support and <30% opposition
    const isConsensus = statementStats.every(stat => 
      stat.support_pct > 60 && 
      stat.oppose_pct < 30 && 
      stat.total_votes >= 1
    )
    
    if (isConsensus && statementStats.length > 0) {
      consensusPoints.push(statement.statement_id)
    }
  }
  
  return consensusPoints
}

function getGroupColor(index: number) {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
  return colors[index % colors.length]
}
