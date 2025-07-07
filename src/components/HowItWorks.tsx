
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Target, Trophy, ChevronDown, ChevronUp, Zap } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const gameRules = [
    {
      icon: Gamepad2,
      step: '1',
      title: 'בחרו את המיקום שלכם',
      description: 'קראו הצהרות בנושא וציינו: תומכים 👍, מתנגדים 👎, או לא בטוחים 🤔',
      color: 'from-[#1a305b] to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Target,
      step: '2', 
      title: 'מצאו נקודות זכייה',
      description: 'המערכת מזהה הצהרות שזוכות לתמיכה רחבה מכל הקבוצות - אלו נקודות הזכייה!',
      color: 'from-[#66c8ca] to-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      icon: Trophy,
      step: '3',
      title: 'זכו יחד!',
      description: 'כשמוצאים מספיק נקודות זכייה לפני שהזמן נגמר - כולם מנצחים במשחק!',
      color: 'from-[#ec0081] to-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  return (
    <Card className="max-w-5xl mx-auto shadow-xl border-2 border-gray-100">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#1a305b] to-[#ec0081] rounded-full flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold hebrew-text bg-gradient-to-r from-[#1a305b] to-[#ec0081] bg-clip-text text-transparent">
              חוקי המשחק
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hebrew-text hover:bg-gray-100 rounded-full"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 ml-1" />
                הסתר חוקים
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 ml-1" />
                למד לשחק
              </>
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
            {gameRules.map((rule, index) => {
              const IconComponent = rule.icon;
              return (
                <div 
                  key={index}
                  className={`${rule.bgColor} rounded-2xl p-6 text-center space-y-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-200`}
                >
                  <div className="relative">
                    <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${rule.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      {rule.step}
                    </div>
                  </div>
                  <h4 className={`text-lg font-bold hebrew-text bg-gradient-to-r ${rule.color} bg-clip-text text-transparent`}>
                    {rule.title}
                  </h4>
                  <p className="text-sm text-gray-700 hebrew-text leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
