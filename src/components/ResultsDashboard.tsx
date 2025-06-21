
import React from 'react';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CountdownTimer } from './CountdownTimer';
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
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  poll,
  statements,
  consensusPoints,
  groups,
  groupStats
}) => {
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;
  
  // Sort statements: consensus points first, then by score
  const sortedStatements = [...statements].sort((a, b) => {
    if (a.is_consensus_point && !b.is_consensus_point) return -1;
    if (!a.is_consensus_point && b.is_consensus_point) return 1;
    return b.score - a.score;
  });

  const getGroupStatsForStatement = (statementId: string) => {
    return groupStats.filter(stat => stat.statement_id === statementId);
  };

  return (
    <TooltipProvider>
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
                    {groups.reduce((sum, group) => sum + group.member_count, 0)}
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

          {/* Groups Legend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-center gap-4">
                {groups.map((group) => (
                  <div key={group.group_id} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="text-sm font-medium">{group.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {group.member_count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statement & Group Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ניתוח הצהרות וקבוצות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sortedStatements.map((statement) => {
                  const statementStats = getGroupStatsForStatement(statement.statement_id);
                  
                  return (
                    <div 
                      key={statement.statement_id} 
                      className={`border rounded-lg p-6 ${
                        statement.is_consensus_point 
                          ? 'bg-consensus-50 border-consensus-300' 
                          : 'bg-white'
                      }`}
                    >
                      <div className="mb-4">
                        <div className="flex items-start gap-3 mb-3">
                          {statement.is_consensus_point && (
                            <Star className="h-5 w-5 text-consensus-500 mt-1 flex-shrink-0" />
                          )}
                          <p className="font-medium leading-relaxed flex-1">
                            {statement.content}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {statement.is_consensus_point && (
                            <Badge className="bg-consensus-500">
                              נקודת חיבור
                            </Badge>
                          )}
                          <Badge variant="outline">
                            נקודות: {statement.score}
                          </Badge>
                          <Badge variant="outline">
                            {statement.total_votes} הצבעות
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Progress Bars - Horizontal on Desktop, Vertical on Mobile */}
                      <div className="space-y-4">
                        <div className={`grid gap-4 ${
                          groups.length <= 2 ? 'md:grid-cols-2' :
                          groups.length <= 3 ? 'md:grid-cols-3' :
                          groups.length <= 4 ? 'md:grid-cols-4' :
                          'md:grid-cols-5'
                        } grid-cols-1`}>
                          {statementStats.map((stat) => {
                            const group = groups.find(g => g.group_id === stat.group_id);
                            if (!group) return null;
                            
                            return (
                              <div key={stat.group_id} className="space-y-2">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: group.color }}
                                  />
                                  <span className="text-sm font-medium text-center">{group.name}</span>
                                </div>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden cursor-pointer">
                                      <div 
                                        className="absolute left-0 top-0 h-full bg-voting-support transition-all"
                                        style={{ 
                                          left: `${100 - stat.support_pct}%`,
                                          width: `${stat.support_pct}%` 
                                        }}
                                      />
                                      <div 
                                        className="absolute top-0 h-full bg-voting-oppose transition-all"
                                        style={{ 
                                          left: `${100 - stat.support_pct - stat.oppose_pct}%`,
                                          width: `${stat.oppose_pct}%` 
                                        }}
                                      />
                                      <div 
                                        className="absolute top-0 h-full bg-voting-unsure transition-all"
                                        style={{ 
                                          left: `0%`,
                                          width: `${stat.unsure_pct}%` 
                                        }}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-sm space-y-1">
                                      <div className="text-voting-support">תמיכה: {Math.round(stat.support_pct)}%</div>
                                      <div className="text-voting-oppose">התנגדות: {Math.round(stat.oppose_pct)}%</div>
                                      <div className="text-voting-unsure">לא בטוח: {Math.round(stat.unsure_pct)}%</div>
                                      <div className="border-t pt-1 text-muted-foreground">
                                        סה"כ הצבעות: {stat.total_votes}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
