
import React from 'react';
import { Group, GroupStatementStats, Statement } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Palette } from 'lucide-react';

interface GroupsVisualizationProps {
  groups: Group[];
  groupStats: GroupStatementStats[];
  statements: Statement[];
}

export const GroupsVisualization: React.FC<GroupsVisualizationProps> = ({
  groups,
  groupStats,
  statements
}) => {
  const getGroupStatsForStatement = (statementId: string) => {
    return groupStats.filter(stat => stat.statement_id === statementId);
  };

  return (
    <div className="space-y-6">
      {/* Groups Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            קבוצות דעות שהתגלו
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {groups.map((group) => (
              <div 
                key={group.group_id}
                className="border rounded-lg p-4"
                style={{ borderColor: group.color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <h4 className="font-semibold">{group.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {group.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {group.member_count} משתתפים
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statement-by-Group Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            פירוט דעות לפי קבוצה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {statements.map((statement) => {
              const statementStats = getGroupStatsForStatement(statement.statement_id);
              
              return (
                <div key={statement.statement_id} className="border rounded-lg p-4">
                  <div className="mb-4">
                    <p className="font-medium leading-relaxed mb-2">
                      {statement.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        נקודות: {statement.score}
                      </Badge>
                      {statement.is_consensus_point && (
                        <Badge className="bg-consensus-500">
                          נקודת חיבור
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {statementStats.map((stat) => {
                      const group = groups.find(g => g.group_id === stat.group_id);
                      if (!group) return null;
                      
                      return (
                        <div key={stat.group_id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: group.color }}
                            />
                            <span className="text-sm font-medium">{group.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({stat.total_votes} הצבעות)
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-voting-support">תמיכה {Math.round(stat.support_pct)}%</span>
                              <span className="text-voting-oppose">התנגדות {Math.round(stat.oppose_pct)}%</span>
                              <span className="text-voting-unsure">לא בטוח {Math.round(stat.unsure_pct)}%</span>
                            </div>
                            <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden">
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
