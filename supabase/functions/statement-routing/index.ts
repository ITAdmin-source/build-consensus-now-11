
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatementWeight {
  statement_id: string;
  predictiveness: number;
  consensus_potential: number;
  recency: number;
  pass_rate_penalty: number;
  combined_weight: number;
}

interface RoutingRequest {
  poll_id: string;
  participant_id: string;
  exclude_statement_ids?: string[];
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

    const { poll_id, participant_id, exclude_statement_ids = [] }: RoutingRequest = await req.json()

    // Check if routing is enabled
    const { data: routingEnabled } = await supabaseClient
      .from('polis_system_settings')
      .select('setting_value')
      .eq('setting_key', 'statement_routing_enabled')
      .single()

    if (!routingEnabled || routingEnabled.setting_value !== 'true') {
      return new Response(
        JSON.stringify({ use_fallback: true, reason: 'routing_disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get poll settings
    const { data: poll } = await supabaseClient
      .from('polis_polls')
      .select('*')
      .eq('poll_id', poll_id)
      .single()

    if (!poll) {
      throw new Error('Poll not found')
    }

    // Get statements that haven't been voted on by this participant
    const { data: unvotedStatements } = await supabaseClient
      .from('polis_statements')
      .select('statement_id, content, created_at')
      .eq('poll_id', poll_id)
      .eq('is_approved', true)
      .not('statement_id', 'in', `(${exclude_statement_ids.map(id => `'${id}'`).join(',')})`)

    if (!unvotedStatements || unvotedStatements.length === 0) {
      return new Response(
        JSON.stringify({ statement: null, weights: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for cached weights
    const { data: cachedWeights } = await supabaseClient
      .from('polis_statement_weights')
      .select('*')
      .eq('poll_id', poll_id)
      .in('statement_id', unvotedStatements.map(s => s.statement_id))
      .gt('expires_at', new Date().toISOString())

    const cachedWeightMap = new Map(cachedWeights?.map(w => [w.statement_id, w]) || [])
    const uncachedStatements = unvotedStatements.filter(s => !cachedWeightMap.has(s.statement_id))

    // Calculate weights for uncached statements
    const newWeights: StatementWeight[] = []
    
    if (uncachedStatements.length > 0) {
      // Get routing settings
      const { data: settings } = await supabaseClient
        .from('polis_system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['routing_cache_ttl_minutes', 'routing_cold_start_boost'])

      const settingsMap = new Map(settings?.map(s => [s.setting_key, s.setting_value]) || [])
      const cacheTtlMinutes = parseInt(settingsMap.get('routing_cache_ttl_minutes') || '5')
      const coldStartBoost = parseFloat(settingsMap.get('routing_cold_start_boost') || '2.0')

      // Get clustering data for predictiveness calculation
      const { data: groups } = await supabaseClient
        .from('polis_groups')
        .select('group_id')
        .eq('poll_id', poll_id)

      const { data: groupStats } = await supabaseClient
        .from('polis_group_statement_stats')
        .select('*')
        .eq('poll_id', poll_id)
        .in('statement_id', uncachedStatements.map(s => s.statement_id))

      for (const statement of uncachedStatements) {
        const statementStats = groupStats?.filter(gs => gs.statement_id === statement.statement_id) || []
        
        // Calculate predictiveness: variance in support across groups
        const predictiveness = calculatePredictiveness(statementStats)
        
        // Calculate consensus potential: likelihood of broad agreement
        const consensus_potential = calculateConsensusPotential(statementStats, poll)
        
        // Calculate recency: time-based boost for newer statements
        const recency = calculateRecency(statement.created_at, coldStartBoost)
        
        // Calculate pass rate penalty: down-weight high-unsure statements
        const pass_rate_penalty = calculatePassRatePenalty(statementStats)
        
        // Combine weights
        const combined_weight = predictiveness * consensus_potential * recency * pass_rate_penalty

        const weight: StatementWeight = {
          statement_id: statement.statement_id,
          predictiveness,
          consensus_potential,
          recency,
          pass_rate_penalty,
          combined_weight
        }
        
        newWeights.push(weight)
      }

      // Cache the new weights
      if (newWeights.length > 0) {
        const weightsToInsert = newWeights.map(w => ({
          ...w,
          poll_id,
          expires_at: new Date(Date.now() + cacheTtlMinutes * 60 * 1000).toISOString()
        }))

        await supabaseClient
          .from('polis_statement_weights')
          .upsert(weightsToInsert, { onConflict: 'statement_id,poll_id' })
      }
    }

    // Combine cached and new weights
    const allWeights = [
      ...Array.from(cachedWeightMap.values()),
      ...newWeights
    ]

    // Perform weighted random selection
    const selectedStatement = weightedRandomSelection(allWeights, unvotedStatements)

    return new Response(
      JSON.stringify({
        statement: selectedStatement,
        weights: allWeights,
        use_fallback: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Statement routing error:', error)
    return new Response(
      JSON.stringify({ 
        use_fallback: true, 
        reason: 'calculation_error',
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function calculatePredictiveness(groupStats: any[]): number {
  if (groupStats.length < 2) return 0.1 // Low predictiveness for single/no group data
  
  const supportPercentages = groupStats.map(gs => gs.support_pct || 0)
  const mean = supportPercentages.reduce((a, b) => a + b, 0) / supportPercentages.length
  const variance = supportPercentages.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / supportPercentages.length
  
  // Normalize variance to 0-1 scale (variance max ~2500 for 0-100% range)
  return Math.min(variance / 2500, 1)
}

function calculateConsensusPotential(groupStats: any[], poll: any): number {
  if (groupStats.length === 0) return 0.5 // Neutral for unknown statements
  
  const minSupportPct = poll.min_support_pct || 50
  const maxOppositionPct = poll.max_opposition_pct || 50
  
  // Check how many groups meet consensus criteria
  const consensusGroups = groupStats.filter(gs => 
    (gs.support_pct || 0) >= minSupportPct && 
    (gs.oppose_pct || 0) <= maxOppositionPct
  )
  
  // Return ratio of groups that could contribute to consensus
  return groupStats.length > 0 ? consensusGroups.length / groupStats.length : 0.5
}

function calculateRecency(createdAt: string, coldStartBoost: number): number {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const ageHours = (now - created) / (1000 * 60 * 60)
  
  // Exponential decay with cold start boost
  // New statements (< 24 hours) get full boost, then gradual decay
  if (ageHours < 24) {
    return coldStartBoost
  }
  
  // Decay function: starts at 1.0 after 24 hours, halves every 7 days
  const daysAfterColdStart = (ageHours - 24) / 24
  return Math.max(0.1, Math.exp(-daysAfterColdStart * Math.log(2) / 7))
}

function calculatePassRatePenalty(groupStats: any[]): number {
  if (groupStats.length === 0) return 1.0
  
  // Calculate average unsure percentage across groups
  const avgUnsurePct = groupStats.reduce((acc, gs) => acc + (gs.unsure_pct || 0), 0) / groupStats.length
  
  // Penalty function: high unsure rate = lower weight
  // 0% unsure = 1.0, 50% unsure = 0.5, 100% unsure = 0.1
  return Math.max(0.1, 1.0 - (avgUnsurePct / 100) * 0.9)
}

function weightedRandomSelection(weights: StatementWeight[], statements: any[]): any {
  if (weights.length === 0 || statements.length === 0) return null
  
  // Create weight map
  const weightMap = new Map(weights.map(w => [w.statement_id, w.combined_weight]))
  
  // Calculate total weight for available statements
  const totalWeight = statements.reduce((sum, stmt) => 
    sum + (weightMap.get(stmt.statement_id) || 0.1), 0
  )
  
  if (totalWeight === 0) {
    // Fallback to random selection
    return statements[Math.floor(Math.random() * statements.length)]
  }
  
  // Weighted random selection
  let random = Math.random() * totalWeight
  
  for (const statement of statements) {
    const weight = weightMap.get(statement.statement_id) || 0.1
    random -= weight
    if (random <= 0) {
      return statement
    }
  }
  
  // Fallback (shouldn't reach here)
  return statements[statements.length - 1]
}
