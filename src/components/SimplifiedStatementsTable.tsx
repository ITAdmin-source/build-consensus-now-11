import React from 'react';
import { Statement, ConsensusPoint } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, List } from 'lucide-react';

interface SimplifiedStatementsTableProps {
  statements: Statement[];
  consensusPoints: ConsensusPoint[];
}

export const SimplifiedStatementsTable: React.FC<SimplifiedStatementsTableProps> = ({
  statements,
  consensusPoints
}) => {
  // Create a set of consensus statement IDs for quick lookup
  const consensusStatementIds = new Set(consensusPoints.map(cp => cp.statement_id));

  // Sort statements by score (highest first), with consensus points at the top
  const sortedStatements = [...statements]
    .filter(s => s.is_approved) // Only show approved statements
    .sort((a, b) => {
      const aIsConsensus = consensusStatementIds.has(a.statement_id);
      const bIsConsensus = consensusStatementIds.has(b.statement_id);
      
      // Consensus points first
      if (aIsConsensus && !bIsConsensus) return -1;
      if (!aIsConsensus && bIsConsensus) return 1;
      
      // Then by score
      return b.score - a.score;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 hebrew-text">
          <List className="h-5 w-5" />
          הצהרות הסקר
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedStatements.map((statement, index) => {
            const isConsensus = consensusStatementIds.has(statement.statement_id);
            
            return (
              <div
                key={statement.statement_id}
                className={`p-4 rounded-lg border transition-colors ${
                  isConsensus 
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200' 
                    : 'bg-card hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Statement Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  
                  {/* Statement Content */}
                  <div className="flex-1 min-w-0">
                    <p className="hebrew-text leading-relaxed text-foreground">
                      {statement.content}
                    </p>
                  </div>
                  
                  {/* Score and Consensus Badge */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    {isConsensus && (
                      <Badge 
                        variant="secondary" 
                        className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200"
                      >
                        <Star className="h-3 w-3 fill-current" />
                        <span className="hebrew-text text-xs">הסכמה</span>
                      </Badge>
                    )}
                    
                    <Badge 
                      variant="outline" 
                      className="font-mono text-sm px-2 py-1"
                    >
                      {statement.score}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
          
          {sortedStatements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground hebrew-text">
              אין הצהרות מאושרות בסקר זה
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};