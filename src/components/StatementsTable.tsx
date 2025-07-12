
import React from 'react';
import { Statement, Group, GroupStatementStats } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Star, 
  BarChart3
} from 'lucide-react';

interface StatementsTableProps {
  statements: Statement[];
  groups: Group[];
  groupStats: GroupStatementStats[];
}

export const StatementsTable: React.FC<StatementsTableProps> = ({
  statements,
  groups,
  groupStats
}) => {
  // Sort statements: consensus points first, then by score
  const sortedStatements = [...statements].sort((a, b) => {
    if (a.is_consensus_point && !b.is_consensus_point) return -1;
    if (!a.is_consensus_point && b.is_consensus_point) return 1;
    return b.score - a.score;
  });

  const getGroupStatsForStatement = (statementId: string, groupId: string) => {
    return groupStats.find(stat => stat.statement_id === statementId && stat.group_id === groupId);
  };

  return (
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
                        <TooltipProvider>
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
                        </TooltipProvider>
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
  );
};
