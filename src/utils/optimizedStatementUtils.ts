
import { Statement } from '@/types/poll';

export type StatementTransition = {
  current: Statement | null;
  next: Statement | null;
  hasMore: boolean;
};

/**
 * Enhanced statement management with pre-loading and transition optimization
 */
export class StatementManager {
  private statements: Statement[];
  private userVotes: Record<string, string>;
  private currentIndex: number = 0;

  constructor(statements: Statement[], userVotes: Record<string, string>) {
    this.statements = statements;
    this.userVotes = userVotes;
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
   * Get current statement transition data
   */
  getCurrentTransition(): StatementTransition {
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
   * Move to next statement after voting
   */
  moveToNext(votedStatementId: string, voteValue: string): StatementTransition {
    // Update votes record optimistically
    this.userVotes[votedStatementId] = voteValue;
    
    // Move to next unvoted statement
    this.currentIndex++;
    while (
      this.currentIndex < this.statements.length &&
      this.userVotes[this.statements[this.currentIndex].statement_id]
    ) {
      this.currentIndex++;
    }

    return this.getCurrentTransition();
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
   * Update with new data (for real-time updates)
   */
  update(statements: Statement[], userVotes: Record<string, string>) {
    this.statements = statements;
    this.userVotes = userVotes;
    this.findCurrentIndex();
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
  return manager.getCurrentTransition().current;
};
