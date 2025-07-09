import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Target, Trophy, ChevronDown, ChevronUp, Zap, Lightbulb } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const gameRules = [
    {
      icon: Gamepad2,
      step: '1',
      title: 'הצביעו ודרגו',
      description: 'תראו היגדים בנושא וציינו: תומכים 👍, מתנגדים 👎, או לא בטוחים 🤔',
      color: '#1a305b',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1a305b]/20'
    },
    {
      icon: Target,
      step: '2', 
      title: 'מצאו נקודות חיבור',
      description: 'המערכת מזהה היגדים שזוכים לתמיכה רחבה מכל קבוצות הדעה - אלו נקודות החיבור!',
      color: '#66c8ca',
      bgColor: 'bg-teal-50',
      borderColor: 'border-[#66c8ca]/20'
    },
    {
      icon: Lightbulb,
      step: '3',
      title: 'גלו תובנות',
      description: ' גלו תובנות מעניינות על עצמכם המבוססות על הבחירות שלכם',
      color: '#ec0081',
      bgColor: 'bg-pink-50',
      borderColor: 'border-[#ec0081]/20'
    },
    {
      icon: Trophy,
      step: '4',
      title: 'זכו יחד!',
      description: 'כשמוצאים מספיק נקודות חיבור לפני שהזמן נגמר - כולם מנצחים במשחק!',
      color: '#ff6b35',
      bgColor: 'bg-orange-50',
      borderColor: 'border-[#ff6b35]/20'
    }
  ];
  
  return (
    <Card className="max-w-5xl mx-auto shadow-xl border-2 border-gray-100">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1a305b] rounded-full flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold hebrew-text text-[#1a305b]">
              חוקי המשחק
            </h3>
          </div>
          {!isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="hebrew-text hover:bg-gray-100 rounded-full"
            >
              <ChevronDown className="h-4 w-4 ml-1" />
              למד לשחק
            </Button>
          )}
        </div>
        
        {isExpanded && (
          <div className="animate-fade-in">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {gameRules.map((rule, index) => {
                const IconComponent = rule.icon;
                return (
                  <div 
                    key={index}
                    className={`${rule.bgColor} rounded-2xl p-6 text-center space-y-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${rule.borderColor}`}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: rule.color }}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold shadow-md" style={{ color: rule.color }}>
                        {rule.step}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold hebrew-text" style={{ color: rule.color }}>
                      {rule.title}
                    </h4>
                    <p className="text-sm text-gray-700 hebrew-text leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={() => setIsExpanded(false)}
                className="hebrew-text bg-[#1a305b] hover:bg-[#1a305b]/90 text-white px-8 py-2 rounded-full"
              >
                הבנתי
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};