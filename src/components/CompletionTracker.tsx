
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RegistrationCTA } from './RegistrationCTA';

interface CompletionTrackerProps {
  completedPolls?: number;
  totalPolls?: number;
  className?: string;
}

export const CompletionTracker: React.FC<CompletionTrackerProps> = ({
  completedPolls = 0,
  totalPolls = 0,
  className = ''
}) => {
  const { user } = useAuth();
  const completionRate = totalPolls > 0 ? (completedPolls / totalPolls) * 100 : 0;

  const getProgressLevel = () => {
    if (completionRate >= 80) return { level: 'מתקדם', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (completionRate >= 50) return { level: 'מנוסה', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (completionRate >= 25) return { level: 'מתחיל', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'חדש', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const progressLevel = getProgressLevel();

  if (!user) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium hebrew-text">מעקב התקדמות</span>
            </div>
            <p className="text-sm text-muted-foreground hebrew-text">
              משתמשים רשומים יכולים לעקוב אחר ההתקדמות שלהם בכל הסקרים
            </p>
            <RegistrationCTA context="completion" compact />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-medium hebrew-text">ההתקדמות שלך</span>
            </div>
            <Badge className={`${progressLevel.bgColor} ${progressLevel.color} border-0`}>
              {progressLevel.level}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm hebrew-text">
              <span>{completedPolls} מתוך {totalPolls} סקרים</span>
              <span>{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground hebrew-text">
            <Target className="h-3 w-3" />
            <span>
              {completionRate < 100 
                ? `עוד ${totalPolls - completedPolls} סקרים להשלמה מלאה`
                : 'השלמת את כל הסקרים הזמינים! 🎉'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
