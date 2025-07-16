import { useState } from 'react';
import { Poll } from '@/types/poll';
import { Statement } from '@/types/poll';
import { getUserVotes } from '@/integrations/supabase/votes';
import { fetchStatementsByPollId } from '@/integrations/supabase/statements';

interface UserVoteData {
  statement: string;
  vote: 'support' | 'oppose' | 'unsure';
  statement_id: string;
}

interface UserSurveyData {
  poll: {
    title: string;
    description: string;
    total_statements: number;
  };
  userVotes: UserVoteData[];
  userStats: {
    total_votes: number;
    support_count: number;
    oppose_count: number;
    unsure_count: number;
  };
}

export const usePersonalInsights = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatSurveyData = async (poll: Poll): Promise<string> => {
    // Get user votes
    const userVotes = await getUserVotes(poll.poll_id);
    
    // Get all statements
    const statements = await fetchStatementsByPollId(poll.poll_id);
    
    // Filter only statements the user voted on
    const userVoteData: UserVoteData[] = statements
      .filter(statement => userVotes[statement.statement_id])
      .map(statement => ({
        statement: statement.content,
        vote: userVotes[statement.statement_id] as 'support' | 'oppose' | 'unsure',
        statement_id: statement.statement_id
      }));

    // Calculate user stats
    const userStats = {
      total_votes: userVoteData.length,
      support_count: userVoteData.filter(v => v.vote === 'support').length,
      oppose_count: userVoteData.filter(v => v.vote === 'oppose').length,
      unsure_count: userVoteData.filter(v => v.vote === 'unsure').length,
    };

    const surveyData: UserSurveyData = {
      poll: {
        title: poll.title,
        description: poll.description || '',
        total_statements: statements.length,
      },
      userVotes: userVoteData,
      userStats,
    };

    // Format for AI prompt
    return `סקר: ${surveyData.poll.title}
תיאור: ${surveyData.poll.description}

הצבעות המשתמש (${userStats.total_votes} מתוך ${surveyData.poll.total_statements}):
תמיכה: ${userStats.support_count}
התנגדות: ${userStats.oppose_count} 
אי ודאות: ${userStats.unsure_count}

פירוט ההצבעות:
${userVoteData.map(vote => `הצהרה: "${vote.statement}"
הצבעה: ${vote.vote === 'support' ? 'תמיכה' : vote.vote === 'oppose' ? 'התנגדות' : 'אי ודאות'}
`).join('\n')}

אנא ספק תובנות אישיות על דפוסי ההצבעה של המשתמש בעברית.`;
  };

  const generateInsights = async (poll: Poll) => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    try {
      // Format user voting data
      const surveyResults = await formatSurveyData(poll);

      // Call the survey_insight edge function
      const response = await fetch('https://reuddlnprvkpgiirxqhr.supabase.co/functions/v1/survey_insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldWRkbG5wcnZrcGdpaXJ4cWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Mjk5MDUsImV4cCI6MjA2MzMwNTkwNX0.50JCjMuJ6WRQcrNjojqlpYUqdlVOVaDIgoI3lp1nBEs'
        },
        body: JSON.stringify({
          prompt: surveyResults
        })
      });

      if (!response.ok) {
        throw new Error(`שגיאה ברשת: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Assuming the response contains the insights in a 'content' or 'message' field
      const insightText = result.content || result.message || result.insight || JSON.stringify(result);
      setInsights(insightText);

    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'אירעה שגיאה לא צפויה');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    insights,
    error,
    generateInsights,
    clearInsights: () => {
      setInsights(null);
      setError(null);
    }
  };
};