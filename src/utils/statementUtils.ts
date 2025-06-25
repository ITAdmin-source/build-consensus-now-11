import { Statement } from '@/types/poll';

export type StatementOrderingStrategy = 'static' | 'random' | 'priority' | 'ml-driven';

/**
 * Filters statements to return only those that haven't been voted on
 */
export const getUnvotedStatements = (
  statements: Statement[],
  userVotes: Record<string, string>
): Statement[] => {
  return statements.filter(statement => !userVotes[statement.statement_id]);
};

/**
 * Orders statements based on the specified strategy
 * Currently returns statements as-is, but can be enhanced for dynamic ordering
 */
export const orderStatements = (
  statements: Statement[],
  strategy: StatementOrderingStrategy = 'static',
  userVotes?: Record<string, string>
): Statement[] => {
  switch (strategy) {
    case 'static':
    default:
      // Keep original order for now - foundation for future dynamic ordering
      return [...statements];
    
    // Future strategies can be added here:
    // case 'random':
    //   return shuffleArray([...statements]);
    // case 'priority':
    //   return prioritizeControversialStatements(statements, userVotes);
    // case 'ml-driven':
    //   return mlDrivenOrdering(statements, userVotes);
  }
};

/**
 * Gets the next statement to display for voting
 */
export const getNextStatementToVote = (
  statements: Statement[],
  userVotes: Record<string, string>,
  orderingStrategy: StatementOrderingStrategy = 'static'
): Statement | null => {
  const unvotedStatements = getUnvotedStatements(statements, userVotes);
  const orderedStatements = orderStatements(unvotedStatements, orderingStrategy, userVotes);
  
  return orderedStatements.length > 0 ? orderedStatements[0] : null;
};
