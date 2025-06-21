
import React from 'react';
import { Poll, Statement, ConsensusPoint } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from './CountdownTimer';
import { 
  Star, 
  Trophy, 
  TrendingUp, 
  Users, 
  Target,
  BarChart3
} from 'lucide-react';

interface ResultsDashboardProps {
  poll: Poll;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  poll,
  statements,
  consensusPoints
}) => {
  const progressPercentage = (poll.current_consensus_points / poll.min_consensus_points_to_win) * 100;
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;
  
  // Sort statements by score
  const sortedStatements = [...statements].sort((a, b) => b.score - a.score);
  const topStatements = sortedStatements.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 hebrew-text">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gradient">
            תוצאות: {poll.title}
          </h1>
          <div className="flex justify-center items-center gap-6">
            <CountdownTimer endTime={poll.end_time} />
            <Badge variant="outline" className="text-lg px-4 py-2">
              {poll.category}
            </Badge>
          </div>
        </div>

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

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-consensus-500" />
              <div className="text-2xl font-bold text-consensus-600">
                {poll.current_consensus_points}
              </div>
              <div className="text-sm text-muted-foreground">נקודות חיבור</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">
                {poll.total_votes}
              </div>
              <div className="text-sm text-muted-foreground">הצבעות</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-purple-600">
                {poll.total_statements}
              </div>
              <div className="text-sm text-muted-foreground">הצהרות</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-muted-foreground">התקדמות</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              התקדמות לעבר המטרה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{poll.current_consensus_points} נקודות חיבור</span>
                <span>מטרה: {poll.min_consensus_points_to_win}</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-4 consensus-gradient"
              />
            </div>
          </CardContent>
        </Card>

        {/* Consensus Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-consensus-500" />
              נקודות החיבור שנמצאו
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consensusPoints.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  עדיין לא נמצאו נקודות חיבור. המשיכו להצביע!
                </p>
              )}
              {consensusPoints.map((point) => (
                <div key={point.statement_id} className="consensus-point">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-consensus-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium leading-relaxed">
                        {point.statement.content}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                        <span>תמיכה: {Math.round(point.statement.support_pct)}%</span>
                        <span>נקודות: {point.statement.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Statements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              הצהרות מובילות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStatements.map((statement, index) => (
                <div key={statement.statement_id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="text-sm">
                      #{index + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium leading-relaxed mb-3">
                        {statement.content}
                      </p>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-voting-support">
                            {Math.round(statement.support_pct)}%
                          </div>
                          <div className="text-muted-foreground">תמיכה</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-voting-oppose">
                            {Math.round(statement.oppose_pct)}%
                          </div>
                          <div className="text-muted-foreground">התנגדות</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-voting-unsure">
                            {Math.round(statement.unsure_pct)}%
                          </div>
                          <div className="text-muted-foreground">לא בטוח</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">
                            {statement.score}
                          </div>
                          <div className="text-muted-foreground">נקודות</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
