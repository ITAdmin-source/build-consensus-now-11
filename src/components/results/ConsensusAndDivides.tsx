
import React from 'react';
import { Poll, Statement, ConsensusPoint, Group, GroupStatementStats } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ConsensusAndDividesProps {
  poll: Poll;
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
  groups: Group[];
  groupStats: GroupStatementStats[];
}

export const ConsensusAndDivides: React.FC<ConsensusAndDividesProps> = ({
  poll,
  statements,
  consensusPoints,
  groups,
  groupStats
}) => {
  // Get consensus statements
  const consensusStatements = consensusPoints.map(cp => cp.statement);

  // Identify controversial statements by calculating variance in group support
  const getControversialStatements = () => {
    const statementVariances = statements.map(statement => {
      const relatedStats = groupStats.filter(stat => stat.statement_id === statement.statement_id);
      
      if (relatedStats.length < 2) return { statement, variance: 0 };
      
      const supportPercentages = relatedStats.map(stat => stat.support_pct || 0);
      const mean = supportPercentages.reduce((sum, val) => sum + val, 0) / supportPercentages.length;
      const variance = supportPercentages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / supportPercentages.length;
      
      return { statement, variance, stats: relatedStats };
    });

    return statementVariances
      .filter(item => item.variance > 400) // High variance threshold
      .sort((a, b) => b.variance - a.variance)
      .slice(0, 4); // Top 4 controversial
  };

  const controversialStatements = getControversialStatements();

  const getGroupVotingBars = (statementId: string) => {
    const relatedStats = groupStats.filter(stat => stat.statement_id === statementId);
    return groups.map(group => {
      const stat = relatedStats.find(s => s.group_id === group.group_id);
      return {
        group,
        support: stat?.support_pct || 0,
        oppose: stat?.oppose_pct || 0,
        unsure: stat?.unsure_pct || (100 - (stat?.support_pct || 0) - (stat?.oppose_pct || 0))
      };
    });
  };

  return (
    <section className="space-y-8">
      {/* Section Title */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800 hebrew-text">
          איפה הסכמנו ואיפה נחלקנו
        </h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto hebrew-text">
          בעוד שנמצאו נקודות מחלוקת, גם התגלו אזורים של הסכמה רחבה.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Consensus */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800 hebrew-text">
              <CheckCircle className="h-6 w-6 text-green-600" />
              כאן הסכמנו ברובנו
            </CardTitle>
            <p className="text-green-700 hebrew-text">
              הצהרות שזכו להסכמה רחבה בין הקבוצות
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {consensusStatements.length > 0 ? (
              consensusStatements.map((statement) => (
                <Card key={statement.statement_id} className="bg-white border-green-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <p className="text-slate-800 hebrew-text leading-relaxed">
                          {statement.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800 hebrew-text">
                            נקודת הסכמה
                          </Badge>
                          <span className="text-sm text-green-600 hebrew-text">
                            ✓ הסכמה בכל הקבוצות
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-green-700 hebrew-text">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>עדיין לא נמצאו נקודות הסכמה ברורות</p>
                <p className="text-sm mt-2">נדרשות עוד הצבעות לזיהוי קונצנזוס</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Controversies */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-orange-800 hebrew-text">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              וכאן הדעות התחלקו
            </CardTitle>
            <p className="text-orange-700 hebrew-text">
              נושאים שעוררו דעות מגוונות בין הקבוצות
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {controversialStatements.length > 0 ? (
              controversialStatements.map(({ statement }) => {
                const votingBars = getGroupVotingBars(statement.statement_id);
                
                return (
                  <Card key={statement.statement_id} className="bg-white border-orange-100">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                          <p className="text-slate-800 hebrew-text leading-relaxed">
                            {statement.content}
                          </p>
                        </div>
                        
                        {/* Group Voting Visualization */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700 hebrew-text">
                            איך הצביעו הקבוצות:
                          </p>
                          {votingBars.map(({ group, support, oppose, unsure }) => (
                            <div key={group.group_id} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: group.color }}
                                />
                                <span className="text-sm text-slate-600 hebrew-text">
                                  {group.name}
                                </span>
                              </div>
                              <div className="flex h-4 rounded overflow-hidden bg-gray-200">
                                <div 
                                  className="bg-green-500 flex items-center justify-center"
                                  style={{ width: `${support}%` }}
                                >
                                  {support > 15 && <TrendingUp className="h-3 w-3 text-white" />}
                                </div>
                                <div 
                                  className="bg-yellow-400 flex items-center justify-center"
                                  style={{ width: `${unsure}%` }}
                                >
                                  {unsure > 15 && <Minus className="h-3 w-3 text-white" />}
                                </div>
                                <div 
                                  className="bg-red-500 flex items-center justify-center"
                                  style={{ width: `${oppose}%` }}
                                >
                                  {oppose > 15 && <TrendingDown className="h-3 w-3 text-white" />}
                                </div>
                              </div>
                              <div className="flex justify-between text-xs text-slate-500 hebrew-text">
                                <span>תמיכה: {Math.round(support)}%</span>
                                <span>לא בטוח: {Math.round(unsure)}%</span>
                                <span>התנגדות: {Math.round(oppose)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-orange-700 hebrew-text">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-orange-500" />
                <p>לא נמצאו מחלוקות משמעותיות</p>
                <p className="text-sm mt-2">רוב ההצהרות זוכות להסכמה יחסית</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
