
import React from 'react';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  console.log('ResultsDashboard props:', {
    poll: poll.title,
    statementsCount: statements.length,
    consensusPointsCount: consensusPoints.length,
    groupsCount: groups.length,
    groupStatsCount: groupStats.length,
    groups,
    groupStats
  });

  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;
  
  // Sort statements: consensus points first, then by score
  const sortedStatements = [...statements].sort((a, b) => {
    if (a.is_consensus_point && !b.is_consensus_point) return -1;
    if (!a.is_consensus_point && b.is_consensus_point) return 1;
    return b.score - a.score;
  });

  // Calculate total participants from groups
  const totalParticipants = groups.reduce((sum, group) => sum + group.member_count, 0);

  const getGroupStatsForStatement = (statementId: string, groupId: string) => {
    const stat = groupStats.find(stat => stat.statement_id === statementId && stat.group_id === groupId);
    console.log(`Looking for stats for statement ${statementId} and group ${groupId}:`, stat);
    return stat;
  };

  // Debug: Show if we have the data we need
  if (groups.length === 0) {
    console.warn('No groups found - table will not show group columns');
  }
  
  if (groupStats.length === 0) {
    console.warn('No group stats found - voting bars will not show');
  }

  return (
    <TooltipProvider>
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

          {/* Debug Information */}
          {(groups.length === 0 || groupStats.length === 0) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="text-sm text-yellow-800">
                  <strong>מידע לפתרון בעיות:</strong>
                  <ul className="mt-2 space-y-1">
                    {groups.length === 0 && <li>• לא נמצאו קבוצות דעות</li>}
                    {groupStats.length === 0 && <li>• לא נמצאו נתונים סטטיסטיים של קבוצות</li>}
                    <li>• סה"כ הצבעות: {poll.total_votes}</li>
                    <li>• סה"כ משתתפים: {totalParticipants}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statements Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ניתוח הצהרות לפי קבוצות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[300px]">הצהרה</TableHead>
                      <TableHead className="w-20 text-center">נקודות</TableHead>
                      {groups.map((group) => (
                        <TableHead key={group.group_id} className="w-32 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: group.color }}
                              />
                              <span className="text-xs font-medium">{group.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs px-1">
                              {group.member_count}
                            </Badge>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedStatements.map((statement) => (
                      <TableRow 
                        key={statement.statement_id}
                        className={statement.is_consensus_point ? 'bg-consensus-50' : ''}
                      >
                        <TableCell>
                          <div className="flex items-start gap-2">
                            {statement.is_consensus_point && (
                              <Star className="h-4 w-4 text-consensus-500 mt-1 flex-shrink-0" />
                            )}
                            <p className="leading-relaxed">{statement.content}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {statement.score}
                        </TableCell>
                        {groups.map((group) => {
                          const stat = getGroupStatsForStatement(statement.statement_id, group.group_id);
                          
                          if (!stat || stat.total_votes === 0) {
                            return (
                              <TableCell key={group.group_id} className="text-center">
                                <div className="text-xs text-muted-foreground">אין נתונים</div>
                              </TableCell>
                            );
                          }
                          
                          return (
                            <TableCell key={group.group_id} className="px-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative h-6 w-full bg-gray-200 rounded-full overflow-hidden cursor-pointer">
                                    {/* Support (green) - from right */}
                                    <div 
                                      className="absolute right-0 top-0 h-full bg-green-500 transition-all"
                                      style={{ 
                                        width: `${stat.support_pct}%` 
                                      }}
                                    />
                                    {/* Oppose (red) - from left */}
                                    <div 
                                      className="absolute left-0 top-0 h-full bg-red-500 transition-all"
                                      style={{ 
                                        width: `${stat.oppose_pct}%` 
                                      }}
                                    />
                                    {/* Unsure (yellow) - in the middle */}
                                    <div 
                                      className="absolute top-0 h-full bg-yellow-400 transition-all"
                                      style={{ 
                                        left: `${stat.oppose_pct}%`,
                                        width: `${stat.unsure_pct}%` 
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-sm space-y-1">
                                    <div className="font-medium">{group.name}</div>
                                    <div className="text-green-600">תמיכה: {Math.round(stat.support_pct)}%</div>
                                    <div className="text-red-600">התנגדות: {Math.round(stat.oppose_pct)}%</div>
                                    <div className="text-yellow-600">לא בטוח: {Math.round(stat.unsure_pct)}%</div>
                                    <div className="border-t pt-1 text-muted-foreground">
                                      סה"כ הצבעות: {stat.total_votes}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
