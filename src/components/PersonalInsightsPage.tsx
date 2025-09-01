import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Home, UserPlus, ArrowRight, Loader2, AlertCircle, ChevronDown, ChevronUp, Sparkles, Brain, User, CheckCircle2, Target } from 'lucide-react';
import { Confetti } from './Confetti';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import { usePersonalInsights } from '@/hooks/usePersonalInsights';
import { useVotingProgress } from '@/hooks/useVotingProgress';
import { useAuth } from '@/contexts/AuthContext';
import { Poll, Statement } from '@/types/poll';
import { extractTextExcerpt } from '@/utils/textExcerpt';
import { NavigationHeader } from './NavigationHeader';

interface PersonalInsightsPageProps {
  poll: Poll;
  statements: Statement[];
  userVotes: Record<string, string>;
  isFullCompletion: boolean;
  onNavigateToMotivation: () => void;
  onNavigateToHome: () => void;
}

export const PersonalInsightsPage: React.FC<PersonalInsightsPageProps> = ({
  poll,
  statements,
  userVotes,
  isFullCompletion,
  onNavigateToMotivation,
  onNavigateToHome
}) => {
  const { createAuthUrl } = useReturnUrl();
  const { user } = useAuth();
  const { isLoading: insightsLoading, insights, error: insightsError, generateInsights, clearInsights } = usePersonalInsights();
  const [showFullInsights, setShowFullInsights] = useState(false);
  const votingProgress = useVotingProgress(poll, statements, userVotes);

  const handleRegisterClick = () => {
    const authUrl = createAuthUrl('/auth');
    window.location.href = authUrl;
  };

  const handleRetryInsights = () => {
    clearInsights();
    generateInsights(poll);
  };

  // Auto-generate insights when component mounts
  useEffect(() => {
    clearInsights();
    generateInsights(poll);
  }, [poll.poll_id]);

  const { excerpt, hasMore } = insights ? extractTextExcerpt(insights) : { excerpt: '', hasMore: false };
  const displayText = showFullInsights ? insights : excerpt;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <Confetti show={isFullCompletion} />
      <NavigationHeader currentPage="results" poll={poll} />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          
          {/* Header Section */}
          <div className="text-center space-y-6 relative overflow-hidden p-8">
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            
            <div className="flex justify-center relative z-10">
              <div className={`p-4 rounded-2xl shadow-lg relative overflow-hidden ${
                isFullCompletion 
                  ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 animate-bounce' 
                  : 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 animate-bounce'
              }`}>
                {/* Sparkle effect for full completion */}
                {isFullCompletion && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 animate-pulse rounded-2xl"></div>
                )}
                <Trophy className="h-12 w-12 text-white drop-shadow-sm relative z-10" />
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              <h1 className={`text-3xl font-bold bg-clip-text text-transparent hebrew-text ${
                isFullCompletion 
                  ? 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600' 
                  : 'bg-gradient-to-r from-green-600 via-blue-600 to-purple-600'
              }`}>
                {isFullCompletion ? 'כל הכבוד! סיימת את הסקר במלואו' : 'תודה על השתתפותך!'}
              </h1>
              <p className="text-lg text-gray-600 hebrew-text font-medium leading-relaxed">
                {isFullCompletion 
                  ? 'מדהים! השלמת את כל ההצהרות. דעתך חשובה ותורמת משמעותית לתוצאות הסקר.'
                  : 'תודה על השתתפותך הפעילה! הדעה שלך חשובה ותורמת לעיצוב התוצאות הסופיות.'
                }
              </p>
            </div>
          </div>

          {/* Personal Voting Progress Section */}
          <div className="p-8 pt-4">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-center gap-3 text-gray-600 mb-6">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-3 rounded-xl">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg hebrew-text font-semibold">ההתקדמות האישית שלי</span>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <Progress 
                    value={votingProgress.completionPercentage} 
                    className="h-4 bg-gray-200/70 rounded-full overflow-hidden" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    <span className="text-lg font-bold text-gray-800 hebrew-text">{votingProgress.votedCount} מתוך {votingProgress.totalCount} הצהרות</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    <span className="text-lg font-bold text-gray-800 hebrew-text">השלמת {Math.round(votingProgress.completionPercentage)}% מהסקר</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Insights Section */}
          <div className="p-8 pt-4">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-3 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 hebrew-text">תובנות אישיות מהסקר</h2>
                {insights && <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />}
              </div>
              
              {insightsLoading && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/30 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-3 text-gray-700 hebrew-text">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="font-medium text-lg">יוצר תובנות אישיות בשבילך...</span>
                  </div>
                </div>
              )}

              {insightsError && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/30 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-center gap-2 text-red-700 hebrew-text">
                    <AlertCircle className="h-6 w-6" />
                    <span className="font-medium text-lg">{insightsError}</span>
                  </div>
                  <Button
                    onClick={handleRetryInsights}
                    size="lg"
                    variant="outline"
                    className="w-full hebrew-text border-red-200 hover:bg-red-50 rounded-xl"
                  >
                    נסה שוב
                  </Button>
                </div>
              )}

              {insights && !insightsLoading && !insightsError && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/30 rounded-xl p-6">
                    <div className="text-base text-gray-800 hebrew-text leading-relaxed font-medium">
                      {displayText}
                    </div>
                  </div>
                  
                  {hasMore && (
                    <Button
                      onClick={() => setShowFullInsights(!showFullInsights)}
                      size="lg"
                      variant="ghost"
                      className="w-full text-base text-purple-600 hebrew-text hover:bg-purple-50 rounded-xl font-semibold transition-all duration-300"
                    >
                      {showFullInsights ? (
                        <>
                          <ChevronUp className="h-5 w-5 ml-2" />
                          הראה פחות
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-5 w-5 ml-2" />
                          הראה יותר
                        </>
                      )}
                    </Button>
                  )}
                  
                  {!user && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/30 rounded-xl p-4">
                      <div className="text-sm text-amber-700 hebrew-text font-medium text-center">
                        הירשם כדי לשמור את התובנות שלך לצפייה עתידית
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 p-8 pt-4 border-t border-gray-200/50">
            {!user && (
              <Button
                onClick={handleRegisterClick}
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hebrew-text font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
              >
                <UserPlus className="h-6 w-6 ml-2 drop-shadow-sm" />
                הירשם כדי לשמור את התובנות שלך
              </Button>
            )}

            <Button
              onClick={onNavigateToMotivation}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white hebrew-text font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
            >
              <ArrowRight className="h-6 w-6 ml-2 drop-shadow-sm" />
              המשך
            </Button>

            <Button
              onClick={onNavigateToHome}
              variant="outline"
              size="lg"
              className="w-full hebrew-text font-semibold py-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02] bg-white/50 backdrop-blur-sm"
            >
              <Home className="h-6 w-6 ml-2 text-blue-600" />
              חזור לעמוד הבית
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};