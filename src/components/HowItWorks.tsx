
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Target, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold hebrew-text">
            איך זה עובד?
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hebrew-text"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 ml-1" />
                הסתר
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 ml-1" />
                למד עוד
              </>
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="grid md:grid-cols-3 gap-6 mt-6 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold hebrew-text">1. הצביעו על הצהרות</h4>
              <p className="text-sm text-muted-foreground hebrew-text leading-relaxed">
                קראו הצהרות בנושא וציינו אם אתם תומכים, מתנגדים או לא בטוחים
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold hebrew-text">2. מצאו נקודות חיבור</h4>
              <p className="text-sm text-muted-foreground hebrew-text leading-relaxed">
                המערכת מזהה הצהרות שזוכות לתמיכה רחבה מכל הקבוצות
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold hebrew-text">3. זכו יחד</h4>
              <p className="text-sm text-muted-foreground hebrew-text leading-relaxed">
                כשמוצאים מספיק נקודות חיבור לפני שהזמן נגמר - כולם זוכים!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
