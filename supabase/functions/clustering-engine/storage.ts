
import { Vote, Participant } from './types.ts';

export async function storeClusteringResults(
  supabase: any, 
  pollId: string, 
  result: any, 
  participants: Participant[], 
  votes: Vote[], 
  statementIds: string[], 
  jobId: string
) {
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

export function calculateGroupStatementStats(groups: any[], votes: Vote[], statementIds: string[], participants: Participant[]): any[] {
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
