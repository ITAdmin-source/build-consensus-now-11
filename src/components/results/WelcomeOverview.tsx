
import React from 'react';
import { Poll, Group } from '@/types/poll';
import { Users, Sparkles, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeOverviewProps {
  poll: Poll;
  groups: Group[];
  totalParticipants: number;
  isPollCompleted: boolean;
}

export const WelcomeOverview: React.FC<WelcomeOverviewProps> = ({
  poll,
  groups,
  totalParticipants,
  isPollCompleted
}) => {
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;

  return (
    <section className="text-center space-y-8 animate-fade-in">
      {/* Hero Title */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-consensus-500 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 hebrew-text">
            הנה מה שגילינו יחד!
          </h1>
          <Sparkles className="h-8 w-8 text-consensus-500 animate-pulse" />
        </div>
        
        <p className="text-xl text-slate-600 max-w-3xl mx-auto hebrew-text leading-relaxed">
          על בסיס ההצבעות שלך והצבעות של {totalParticipants - 1} משתתפים נוספים, 
          גילינו דפוסים ברורים של הסכמה וקונצנזוס.
        </p>
      </div>

      {/* Victory Banner or Status */}
      {isWinning ? (
        <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-green-300 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Target className="h-12 w-12 text-green-600 animate-bounce-gentle" />
              <h2 className="text-3xl font-bold text-green-800 hebrew-text">
                הגענו לקונצנזוס!
              </h2>
            </div>
            <p className="text-lg text-green-700 hebrew-text">
              מצאנו {poll.current_consensus_points} נקודות חיבור משותפות - זה ניצחון קבוצתי!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Target className="h-10 w-10 text-blue-600" />
              <h2 className="text-2xl font-bold text-blue-800 hebrew-text">
                המסע נמשך...
              </h2>
            </div>
            <p className="text-blue-700 hebrew-text">
              מצאנו {poll.current_consensus_points} נקודות חיבור מתוך {poll.min_consensus_points_to_win} הנדרשות
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cluster Visualization Preview */}
      {groups.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-slate-700 hebrew-text">
            קבוצות הדעה שהתגבשו
          </h3>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {groups.map((group, index) => (
              <div 
                key={group.group_id}
                className="flex flex-col items-center space-y-2 animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: group.color }}
                >
                  <Users className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700 hebrew-text">
                    {group.name}
                  </p>
                  <p className="text-sm text-slate-500 hebrew-text">
                    {group.member_count} משתתפים
                  </p>
                  <p className="text-xs text-slate-400 hebrew-text mt-1">
                    {Math.round((group.member_count / totalParticipants) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
