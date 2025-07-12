
import React from 'react';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatementsTable } from '@/components/StatementsTable';
import { ParticipantsChart } from '@/components/ParticipantsChart';
import { 
  Star, 
  Trophy, 
  Users, 
  Target,
  BarChart3,
  Vote
} from 'lucide-react';

interface ResultsDashboardProps {
  poll: Poll;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
  groups: Group[];
  groupStats: GroupStatementStats[];
  isPollCompleted?: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  poll,
  statements,
  consensusPoints,
  groups,
  groupStats,
  isPollCompleted = false
}) => {
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;
  const consensusProgress = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  
  // Use simple participant count from poll data (updated in real-time)
  const totalParticipants = (() => {
    // Primary: Use poll's total_participants (updated in real-time when users vote)
    if (poll.total_participants) {
      return poll.total_participants;
    }
    
    // Fallback 1: Calculate from groups data if available (after clustering)
    if (groups && groups.length > 0) {
      return groups.reduce((sum, group) => sum + group.member_count, 0);
    }
    
    // Fallback 2: Minimum of 1 if poll exists but no data yet
    return 1;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 hebrew-text">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Victory Banner */}
        {isWinning && (
          <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-green-600 animate-bounce-gentle" />
              <h2 className="text-3xl font-bold text-green-800 mb-2">
                🎉 ניצחון קבוצתי! 🎉
              </h2>
              <p className="text-lg text-green-700">
                מצאתם {poll.current_consensus_points} נקודות חיבור - כולם זוכים יחד!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Consensus Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-consensus-500" />
                  <span className="font-medium hebrew-text">
                    נקודות חיבור: {poll.current_consensus_points}/{poll.min_consensus_points_to_win}
                  </span>
                  {isWinning && (
                    <Badge variant="default" className="text-xs">
                      ניצחון!
                    </Badge>
                  )}
                </div>
                <Progress 
                  value={consensusProgress} 
                  className="h-3 consensus-gradient" 
                />
                <p className="text-xs text-muted-foreground hebrew-text mt-1">
                  {isPollCompleted 
                    ? (isWinning ? 'ניצחון קבוצתי הושג!' : 'התוצאות הסופיות')
                    : (isWinning ? 'ניצחון קבוצתי!' : 'נקודות חיבור שנמצאו')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Poll Statistics */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-5 gap-6">
              <div className="text-center">
                <Vote className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-blue-600">
                  {poll.total_votes}
                </div>
                <div className="text-sm text-muted-foreground">הצבעות</div>
              </div>
              
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-purple-600">
                  {totalParticipants}
                </div>
                <div className="text-sm text-muted-foreground">משתתפים</div>
              </div>
              
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-orange-600">
                  {poll.total_statements}
                </div>
                <div className="text-sm text-muted-foreground">הצהרות</div>
              </div>
              
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-consensus-500" />
                <div className="text-2xl font-bold text-consensus-600">
                  {poll.current_consensus_points}
                </div>
                <div className="text-sm text-muted-foreground">נקודות חיבור</div>
              </div>
              
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-600">
                  {groups.length}
                </div>
                <div className="text-sm text-muted-foreground">קבוצות דעות</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statements Table */}
        <StatementsTable 
          statements={statements}
          groups={groups}
          groupStats={groupStats}
        />

        {/* Participants Visualization Chart */}
        <ParticipantsChart groups={groups} />
      </div>
    </div>
  );
};
