export interface VotingGoalProgress {
  currentVotes: number;
  goalVotes: number;
  percentage: number;
  isGoalReached: boolean;
  displayText: string;
}

export const calculateVotingProgress = (currentVotes: number, goalVotes: number): VotingGoalProgress => {
  const percentage = Math.min((currentVotes / goalVotes) * 100, 100);
  const isGoalReached = currentVotes >= goalVotes;
  
  return {
    currentVotes,
    goalVotes,
    percentage,
    isGoalReached,
    displayText: `${currentVotes.toLocaleString()}/${goalVotes.toLocaleString()} הצבעות (${Math.round(percentage)}%)`
  };
};