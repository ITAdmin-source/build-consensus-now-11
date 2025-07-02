
import { Statement } from '@/types/poll';
import { supabase } from '@/integrations/supabase/client';

export type StatementTransition = {
  current: Statement | null;
  next: Statement | null;
  hasMore: boolean;
};

/**
 * Enhanced statement management with Pol.is-style weighted routing
 */
export class StatementManager {
  private statements: Statement[];
  private userVotes: Record<string, string>;
  private currentIndex: number = 0;
  private pollId: string;
  private participantId: string;
  private routingEnabled: boolean = false;

  constructor(statements: Statement[], userVotes: Record<string, string>, pollId?: string, participantId?: string) {
    this.statements = statements;
    this.userVotes = userVotes;
    this.pollId = pollId || '';
    this.participantId = participantId || '';
    this.findCurrentIndex();
  }

  private findCurrentIndex() {
    // Find the first unvoted statement
    this.currentIndex = this.statements.findIndex(
      statement => !this.userVotes[statement.statement_id]
    );
    
    if (this.currentIndex === -1) {
      this.currentIndex = this.statements.length;
    }
  }

  /**
   * Get current statement transition data with optional weighted routing
   */
  async getCurrentTransition(): Promise<StatementTransition> {
    // Try weighted routing first if enabled
    if (this.pollId && this.participantId && this.routingEnabled) {
      try {
        const routedStatement = await this.getWeightedStatement();
        if (routedStatement) {
          return {
            current: routedStatement,
            next: null, // Will be calculated on next call
            hasMore: this.getRemainingCount() > 1
          };
        }
      } catch (error) {
        console.warn('Weighted routing failed, falling back to static order:', error);
      }
    }

    // Fallback to static ordering
    const current = this.currentIndex < this.statements.length 
      ? this.statements[this.currentIndex] 
      : null;
    
    const next = this.currentIndex + 1 < this.statements.length 
      ? this.statements[this.currentIndex + 1] 
      : null;

    return {
      current,
      next,
      hasMore: this.currentIndex < this.statements.length - 1
    };
  }

  /**
   * Get weighted statement using the routing edge function
   */
  private async getWeightedStatement(): Promise<Statement | null> {
    const excludeStatementIds = Object.keys(this.userVotes);
    
    const { data, error } = await supabase.functions.invoke('statement-routing', {
      body: {
        poll_id: this.pollId,
        participant_id: this.participantId,
        exclude_statement_ids: excludeStatementIds
      }
    });

    if (error) {
      throw error;
    }

    if (data.use_fallback) {
      return null; // Will trigger fallback to static ordering
    }

    return data.statement;
  }

  /**
   * Move to next statement after voting
   */
  moveToNext(votedStatementId: string, voteValue: string): StatementTransition {
    // Update votes record optimistically
    this.userVotes[votedStatementId] = voteValue;
    
    // For weighted routing, we don't need to update index since each call is fresh
    if (this.routingEnabled) {
      return {
        current: null, // Will be fetched fresh on next getCurrentTransition call
        next: null,
        hasMore: this.getRemainingCount() > 0
      };
    }

    // For static routing, move to next unvoted statement
    this.currentIndex++;
    while (
      this.currentIndex < this.statements.length &&
      this.userVotes[this.statements[this.currentIndex].statement_id]
    ) {
      this.currentIndex++;
    }

    const current = this.currentIndex < this.statements.length 
      ? this.statements[this.currentIndex] 
      : null;
    
    const next = this.currentIndex + 1 < this.statements.length 
      ? this.statements[this.currentIndex + 1] 
      : null;

    return {
      current,
      next,
      hasMore: this.currentIndex < this.statements.length - 1
    };
  }

  /**
   * Get remaining statements count
   */
  getRemainingCount(): number {
    return this.statements.filter(
      statement => !this.userVotes[statement.statement_id]
    ).length;
  }

  /**
   * Enable or disable weighted routing
   */
  setRoutingEnabled(enabled: boolean) {
    this.routingEnabled = enabled;
  }

  /**
   * Update with new data (for real-time updates)
   */
  update(statements: Statement[], userVotes: Record<string, string>) {
    this.statements = statements;
    this.userVotes = userVotes;
    if (!this.routingEnabled) {
      this.findCurrentIndex();
    }
  }
}

/**
 * Legacy compatibility functions
 */
export const getUnvotedStatements = (
  statements: Statement[],
  userVotes: Record<string, string>
): Statement[] => {
  return statements.filter(statement => !userVotes[statement.statement_id]);
};

export const getNextStatementToVote = (
  statements: Statement[],
  userVotes: Record<string, string>
): Statement | null => {
  const manager = new StatementManager(statements, userVotes);
  const transition = manager.getCurrentTransition();
  return transition instanceof Promise ? null : transition.current;
};
