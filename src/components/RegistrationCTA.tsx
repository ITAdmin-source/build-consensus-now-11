
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import { LogIn, Star, Users, TrendingUp, Brain, Heart } from 'lucide-react';

interface RegistrationCTAProps {
  context: 'points' | 'insights' | 'social' | 'completion' | 'results';
  className?: string;
  compact?: boolean;
  userPoints?: number;
}

export const RegistrationCTA: React.FC<RegistrationCTAProps> = ({
  context,
  className = '',
  compact = false,
  userPoints = 0
}) => {
  const { createAuthUrl } = useReturnUrl();

  const getContextConfig = () => {
    switch (context) {
      case 'points':
        return {
          icon: Star,
          title: 'שמור את הנקודות שלך!',
          subtitle: `עם ${userPoints} נקודות, אתה כבר בדרך לתחרויות מיוחדות וזכייה בפרסים`,
          buttonText: 'הרשמה לשמירת נקודות',
          benefits: ['שמירת נקודות לצמיתות', 'השתתפות בתחרויות', 'מעקב אחר התקדמות'],
          gradient: 'from-yellow-100 to-orange-100',
          borderColor: 'border-yellow-200'
        };
      case 'insights':
        return {
          icon: Brain,
          title: 'שמור את התובנות שלך',
          subtitle: 'צפה בהתפתחות הדעות שלך לאורך זמן ובנה פרופיל אישי מעמיק',
          buttonText: 'הרשמה לשמירת תובנות',
          benefits: ['היסטוריית תובנות אישיות', 'מעקב אחר שינויים', 'השוואות עם הקהילה'],
          gradient: 'from-purple-100 to-blue-100',
          borderColor: 'border-purple-200'
        };
      case 'social':
        return {
          icon: Users,
          title: 'הצטרף לקהילה',
          subtitle: 'למעלה מ-2,800 משתתפים רשומים משתפים דעות ובונים קונצנזוס',
          buttonText: 'הצטרפות לקהילה',
          benefits: ['חלק מקהילה פעילה', 'השפעה על דיונים', 'גישה לתוכן בלעדי'],
          gradient: 'from-green-100 to-teal-100',
          borderColor: 'border-green-200'
        };
      case 'completion':
        return {
          icon: TrendingUp,
          title: 'עקוב אחר ההתקדמות שלך',
          subtitle: 'ראה כמה סקרים השלמת והשווה את עצמך למשתתפים אחרים',
          buttonText: 'הרשמה למעקב התקדמות',
          benefits: ['מעקב פעילות אישית', 'סטטיסטיקות מפורטות', 'הישגים ואתגרים'],
          gradient: 'from-blue-100 to-indigo-100',
          borderColor: 'border-blue-200'
        };
      case 'results':
        return {
          icon: Heart,
          title: 'גלה עוד תובנות',
          subtitle: 'משתמשים רשומים מקבלים גישה לניתוחים מעמיקים ותחזיות',
          buttonText: 'הרשמה לתוכן מתקדם',
          benefits: ['ניתוחים מתקדמים', 'תחזיות אישיות', 'דוחות מיוחדים'],
          gradient: 'from-pink-100 to-rose-100',
          borderColor: 'border-pink-200'
        };
      default:
        return {
          icon: LogIn,
          title: 'הרשמה למערכת',
          subtitle: 'קבל גישה מלאה לכל התכונות',
          buttonText: 'הרשמה',
          benefits: [],
          gradient: 'from-gray-100 to-slate-100',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getContextConfig();
  const IconComponent = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r ${config.gradient} ${config.borderColor} border ${className}`}>
        <IconComponent className="h-4 w-4 text-primary" />
        <span className="text-sm hebrew-text flex-1">{config.title}</span>
        <Link to={createAuthUrl()}>
          <Button size="sm" variant="outline" className="hebrew-text">
            הרשמה
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className={`${config.borderColor} border-2 bg-gradient-to-br ${config.gradient} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg hebrew-text mb-1">{config.title}</h3>
            <p className="text-sm text-muted-foreground hebrew-text mb-3">
              {config.subtitle}
            </p>
            {config.benefits.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {config.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs hebrew-text">
                    {benefit}
                  </Badge>
                ))}
              </div>
            )}
            <Link to={createAuthUrl()}>
              <Button className="w-full hebrew-text">
                <LogIn className="h-4 w-4 ml-2" />
                {config.buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
