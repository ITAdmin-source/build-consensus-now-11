import React, { useState } from 'react';
import { Poll, Statement, Group } from '@/types/poll';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  PlusCircle, 
  Share2, 
  BarChart3, 
  Heart, 
  Lightbulb, 
  Users,
  Sparkles,
  ThumbsUp,
  Eye
} from 'lucide-react';

interface TakeawaysSectionProps {
  poll: Poll;
  statements: Statement[];
  groups: Group[];
  totalParticipants: number;
}

interface EmojiReaction {
  emoji: string;
  label: string;
  count: number;
}

export const TakeawaysSection: React.FC<TakeawaysSectionProps> = ({
  poll,
  statements,
  groups,
  totalParticipants
}) => {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  const reactions: EmojiReaction[] = [
    { emoji: '🤯', label: 'הפתעה גדולה', count: 12 },
    { emoji: '🤔', label: 'מעניין', count: 8 },
    { emoji: '👍', label: 'מגניב', count: 15 },
    { emoji: '😮', label: 'לא ידעתי', count: 6 },
    { emoji: '💡', label: 'הבנתי משהו חדש', count: 10 }
  ];

  const handleReaction = (emoji: string) => {
    if (selectedReaction === emoji) {
      setSelectedReaction(null);
    } else {
      setSelectedReaction(emoji);
      // In real app, would save to database
    }
  };

  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;

  return (
    <section className="space-y-8">
      {/* Section Title */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-consensus-500" />
          <h2 className="text-3xl font-bold text-slate-800 hebrew-text">
            סיכום ומסקנות
          </h2>
          <Sparkles className="h-6 w-6 text-consensus-500" />
        </div>
        <p className="text-lg text-slate-600 hebrew-text">
          עזרת למפות את השיחה הקבוצתית - תודה!
        </p>
      </div>

      {/* Reaction Poll */}
      <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-center hebrew-text text-purple-800">
            מה הכי הפתיע אותך?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-3">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  selectedReaction === reaction.emoji
                    ? 'border-purple-500 bg-purple-100 shadow-md'
                    : 'border-purple-200 bg-white hover:border-purple-300'
                }`}
              >
                <span className="text-2xl mb-1">{reaction.emoji}</span>
                <span className="text-sm text-slate-700 hebrew-text text-center">
                  {reaction.label}
                </span>
                <Badge variant="outline" className="mt-1 text-xs">
                  {reaction.count}
                </Badge>
              </button>
            ))}
          </div>
          {selectedReaction && (
            <p className="text-center text-sm text-purple-700 mt-3 hebrew-text animate-fade-in">
              תודה על המשוב! התגובה שלך נשמרה.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Gratitude Message */}
      <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold text-slate-800 mb-3 hebrew-text">
            תודה שהשתתפת במחקר הקולקטיבי!
          </h3>
          <p className="text-slate-600 hebrew-text leading-relaxed mb-4">
            יחד עם {totalParticipants} משתתפים, עזרת ליצור מפה של הדעות והעמדות בנושא. 
            {isWinning && ' הגעתם יחד לקונצנזוס - זה הישג מרשים!'}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hebrew-text">{totalParticipants} משתתפים</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hebrew-text">{statements.length} הצהרות</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span className="hebrew-text">{poll.total_votes} הצבעות</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:scale-105">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800 mb-2 hebrew-text">
              דיון עם אחרים
            </h4>
            <p className="text-sm text-slate-600 hebrew-text mb-3">
              רוצה לדבר על התוצאות עם המשתתפים האחרים?
            </p>
            <Button variant="outline" size="sm" className="hebrew-text">
              הצטרף לדיון
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:scale-105">
          <CardContent className="p-6 text-center">
            <PlusCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800 mb-2 hebrew-text">
              הצע הצהרה חדשה
            </h4>
            <p className="text-sm text-slate-600 hebrew-text mb-3">
              יש לך רעיון להצהרה שתעשיר את הדיון?
            </p>
            <Button variant="outline" size="sm" className="hebrew-text">
              הוסף הצהרה
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:scale-105">
          <CardContent className="p-6 text-center">
            <Share2 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800 mb-2 hebrew-text">
              שתף תוצאות
            </h4>
            <p className="text-sm text-slate-600 hebrew-text mb-3">
              שתף את הממצאים עם חברים ועמיתים
            </p>
            <Button variant="outline" size="sm" className="hebrew-text">
              שתף
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:scale-105">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800 mb-2 hebrew-text">
              נתונים מפורטים
            </h4>
            <p className="text-sm text-slate-600 hebrew-text mb-3">
              רוצה לראות ניתוח מעמיק יותר?
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="hebrew-text"
              onClick={() => setShowDetailedStats(!showDetailedStats)}
            >
              {showDetailedStats ? 'הסתר' : 'הצג'} פרטים
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats (collapsible) */}
      {showDetailedStats && (
        <Card className="max-w-4xl mx-auto animate-fade-in">
          <CardHeader>
            <CardTitle className="hebrew-text">נתונים מפורטים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">{poll.total_votes}</div>
                <div className="text-sm text-slate-600 hebrew-text">סה"כ הצבעות</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">{poll.current_consensus_points}</div>
                <div className="text-sm text-slate-600 hebrew-text">נקודות הסכמה</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">{groups.length}</div>
                <div className="text-sm text-slate-600 hebrew-text">קבוצות דעות</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-600">{statements.length}</div>
                <div className="text-sm text-slate-600 hebrew-text">הצהרות</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};
