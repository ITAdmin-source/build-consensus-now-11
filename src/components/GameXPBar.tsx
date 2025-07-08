
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap } from 'lucide-react';

interface GameXPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  achievements?: string[];
  className?: string;
}

export const GameXPBar: React.FC<GameXPBarProps> = ({
  currentXP,
  maxXP,
  level,
  achievements = [],
  className = ""
}) => {
  const progressPercentage = (currentXP / maxXP) * 100;
  
  return (
    <Card className={`game-card-glow border-2 border-[#66c8ca]/30 bg-gradient-to-r from-white/90 to-blue-50/90 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Level Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#1a305b] to-[#66c8ca] flex items-center justify-center">
                <span className="text-white font-bold text-sm">{level}</span>
              </div>
              <span className="font-bold text-[#1a305b] hebrew-text">שלב {level}</span>
            </div>
            
            <div className="flex items-center gap-1">
              {achievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className="achievement-badge w-6 h-6 rounded-full flex items-center justify-center">
                  {index === 0 && <Trophy className="h-3 w-3 text-[#1a305b]" />}
                  {index === 1 && <Star className="h-3 w-3 text-[#1a305b]" />}
                  {index === 2 && <Zap className="h-3 w-3 text-[#1a305b]" />}
                </div>
              ))}
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="hebrew-text text-[#1a305b] font-medium">התקדמות</span>
              <Badge variant="outline" className="text-xs hebrew-text">
                {currentXP}/{maxXP} נקודות
              </Badge>
            </div>
            
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-gray-200"
              />
              <div 
                className="absolute top-0 left-0 h-3 xp-bar rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground hebrew-text text-center">
              {maxXP - currentXP > 0 
                ? `${maxXP - currentXP} נקודות עד השלב הבא`
                : 'שלב הושלם! 🎉'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
