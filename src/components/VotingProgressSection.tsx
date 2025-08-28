import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Users } from 'lucide-react';
import { calculateVotingProgress } from '@/utils/votingProgress';

interface VotingProgressSectionProps {
  currentVotes: number;
  goalVotes: number;
}

export const VotingProgressSection: React.FC<VotingProgressSectionProps> = ({
  currentVotes,
  goalVotes
}) => {
  const progress = calculateVotingProgress(currentVotes, goalVotes);

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold hebrew-text mb-2">התקדמות הסקר</h3>
        <p className="text-muted-foreground hebrew-text text-sm">
          {progress.displayText}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress 
          value={progress.percentage} 
          className="h-3"
          threshold={80} // Show threshold marker at 80%
        />
        
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{currentVotes.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {progress.isGoalReached && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hebrew-text">
                יעד הושג!
              </Badge>
            )}
            
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{goalVotes.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {!progress.isGoalReached && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground hebrew-text">
            נותרו {(goalVotes - currentVotes).toLocaleString()} הצבעות ליעד
          </p>
        </div>
      )}
    </div>
  );
};