
import { Vote, Participant } from './types.ts';

export function buildVoteMatrix(votes: Vote[], statementIds: string[]): Participant[] {
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

export function voteToNumeric(vote: string): number {
  switch (vote) {
    case 'support': return 1
    case 'oppose': return -1
    case 'unsure': return 0
    default: return 0
  }
}
