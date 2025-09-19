
import { Vote, Participant } from './types.ts';

export function buildVoteMatrix(votes: Vote[], statementIds: string[]): Participant[] {
  console.log('Building vote matrix...')
  const participantMap = new Map<string, Participant>()

  // Initialize participants with proper ID handling (both session_id and user_id)
  votes.forEach(vote => {
    // Use session_id if available, otherwise use user_id, fallback to 'anonymous'
    const participantId = vote.session_id || vote.user_id?.toString() || 'anonymous'
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
    const participantId = vote.session_id || vote.user_id?.toString() || 'anonymous'
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

  // Debug logging for vote matrix verification
  console.log('=== VOTE MATRIX DEBUG ===')
  participants.forEach((participant, i) => {
    const votePattern = statementIds.map(sid => participant.votes[sid]).join(',')
    console.log(`Participant ${participant.session_id}: [${votePattern}]`)
  })

  console.log(`Vote matrix completed with ${participants.length} participants and ${statementIds.length} statements`)
  return participants
}

export function voteToNumeric(vote: string): number {
  switch (vote) {
    case 'support': return 1
    case 'oppose': return -1
    case 'unsure': return 0
    default: return 0
  }
}
