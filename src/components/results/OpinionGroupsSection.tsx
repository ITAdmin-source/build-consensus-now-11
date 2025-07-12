
import React, { useState } from 'react';
import { Group, GroupStatementStats, Statement } from '@/types/poll';
import { UserPoints } from '@/integrations/supabase/userPoints';
import { ParticipantsChart } from '@/components/ParticipantsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, TrendingUp, TrendingDown } from 'lucide-react';

interface OpinionGroupsSectionProps {
  groups: Group[];
  groupStats: GroupStatementStats[];
  statements: Statement[];
  userPoints: UserPoints;
}

export const OpinionGroupsSection: React.FC<OpinionGroupsSectionProps> = ({
  groups,
  groupStats,
  statements,
  userPoints
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [userGroup, setUserGroup] = useState<Group | null>(null);

  // Find user's group (simplified - in real app would need session/user matching)
  React.useEffect(() => {
    if (groups.length > 0) {
      // For demo purposes, assign user to first group
      // In real implementation, would match by session_id or user_id
      setUserGroup(groups[0]);
    }
  }, [groups]);

  const getGroupTopStatements = (groupId: string, isSupport: boolean = true) => {
    const groupStatsForGroup = groupStats.filter(stat => stat.group_id === groupId);
    const sortedStats = groupStatsForGroup.sort((a, b) => 
      isSupport ? (b.support_pct || 0) - (a.support_pct || 0) : (b.oppose_pct || 0) - (a.oppose_pct || 0)
    );
    
    return sortedStats.slice(0, 3).map(stat => {
      const statement = statements.find(s => s.statement_id === stat.statement_id);
      return {
        statement: statement?.content || '',
        percentage: isSupport ? stat.support_pct || 0 : stat.oppose_pct || 0
      };
    });
  };

  if (groups.length === 0) {
    return (
      <section className="text-center py-12">
        <p className="text-lg text-slate-600 hebrew-text">
          עדיין לא נוצרו קבוצות דעה. נדרשים עוד משתתפים לניתוח.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {/* Section Title */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800 hebrew-text">
          קבוצות דעה שונות התגבשו על בסיס חשיבה משותפת
        </h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto hebrew-text">
          המפה הבאה מציגה את הקבוצות השונות שנוצרו על בסיס דפוסי הצבעה דומים. 
          עבר עם העכבר על קבוצה לראות פרטים נוספים.
        </p>
      </div>

      {/* User Group Identification */}
      {userGroup && (
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: userGroup.color }}
              />
              <h3 className="text-xl font-semibold text-slate-800 hebrew-text">
                אתה היית ב{userGroup.name}
              </h3>
            </div>
            <p className="text-slate-600 hebrew-text mb-2">
              {userGroup.description}
            </p>
            <Badge variant="outline" className="hebrew-text">
              יחד עם {userGroup.member_count - 1} משתתפים נוספים
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Participants Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ParticipantsChart groups={groups} />
      </div>

      {/* Interactive Group Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card 
            key={group.group_id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              selectedGroup === group.group_id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedGroup(selectedGroup === group.group_id ? null : group.group_id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 hebrew-text">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                {group.name}
              </CardTitle>
              <p className="text-sm text-slate-600 hebrew-text">
                {group.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600 hebrew-text">
                    {group.member_count} משתתפים
                  </span>
                </div>
                <Badge variant="outline" className="hebrew-text">
                  {Math.round((group.member_count / groups.reduce((sum, g) => sum + g.member_count, 0)) * 100)}%
                </Badge>
              </div>

              {selectedGroup === group.group_id && (
                <div className="space-y-3 animate-fade-in">
                  {/* Top Support Statements */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 hebrew-text">
                        הכי תמכו:
                      </span>
                    </div>
                    {getGroupTopStatements(group.group_id, true).slice(0, 2).map((item, idx) => (
                      <div key={idx} className="text-xs text-slate-600 pr-4 hebrew-text">
                        • {item.statement.substring(0, 80)}...
                        <span className="font-medium text-green-600 mr-2">
                          ({Math.round(item.percentage)}% תמיכה)
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Top Opposition Statements */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700 hebrew-text">
                        הכי התנגדו:
                      </span>
                    </div>
                    {getGroupTopStatements(group.group_id, false).slice(0, 2).map((item, idx) => (
                      <div key={idx} className="text-xs text-slate-600 pr-4 hebrew-text">
                        • {item.statement.substring(0, 80)}...
                        <span className="font-medium text-red-600 mr-2">
                          ({Math.round(item.percentage)}% התנגדות)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedGroup !== group.group_id && (
                <div className="flex items-center gap-2 text-sm text-slate-500 hebrew-text">
                  <Eye className="h-4 w-4" />
                  לחץ לראות עמדות מרכזיות
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
