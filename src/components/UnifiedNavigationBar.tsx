import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Home, 
  UserPlus, 
  Share2, 
  BarChart3, 
  Brain, 
  ArrowLeft,
  Eye
} from 'lucide-react';

interface UnifiedNavigationBarProps {
  currentState: 'voting' | 'insights' | 'motivation' | 'results';
  isAuthenticated?: boolean;
  isPollCompleted?: boolean;
  canNavigateBack?: boolean;
  
  // Navigation callbacks
  onNavigateToHome?: () => void;
  onNavigateToInsights?: () => void;
  onNavigateToMotivation?: () => void;
  onNavigateToResults?: () => void;
  onNavigateBack?: () => void;
  onShare?: () => void;
  onRegister?: () => void;
  onEndEarly?: () => void;
  onShowDetailedResults?: () => void;
  
  className?: string;
}

export const UnifiedNavigationBar: React.FC<UnifiedNavigationBarProps> = ({
  currentState,
  isAuthenticated = false,
  isPollCompleted = false,
  canNavigateBack = false,
  onNavigateToHome,
  onNavigateToInsights,
  onNavigateToMotivation,
  onNavigateToResults,
  onNavigateBack,
  onShare,
  onRegister,
  onEndEarly,
  onShowDetailedResults,
  className = ""
}) => {
  const getNavigationContent = () => {
    switch (currentState) {
      case 'voting':
        return {
          leftActions: canNavigateBack ? [
            {
              key: 'back',
              label: 'חזור',
              icon: ArrowLeft,
              onClick: onNavigateBack,
              variant: 'ghost' as const
            }
          ] : [],
          rightActions: [
            ...(onEndEarly ? [{
              key: 'end-early',
              label: 'סיים עכשיו',
              icon: ArrowRight,
              onClick: onEndEarly,
              variant: 'default' as const
            }] : []),
            ...(onNavigateToHome ? [{
              key: 'home',
              label: 'דף הבית',
              icon: Home,
              onClick: onNavigateToHome,
              variant: 'outline' as const
            }] : [])
          ]
        };

      case 'insights':
        return {
          leftActions: canNavigateBack ? [
            {
              key: 'back',
              label: 'חזור להצבעה',
              icon: ArrowLeft,
              onClick: onNavigateBack,
              variant: 'ghost' as const
            }
          ] : [],
          rightActions: [
            ...(onNavigateToMotivation ? [{
              key: 'continue',
              label: 'המשך',
              icon: ArrowRight,
              onClick: onNavigateToMotivation,
              variant: 'default' as const
            }] : []),
            ...(!isAuthenticated && onRegister ? [{
              key: 'register',
              label: 'הירשם',
              icon: UserPlus,
              onClick: onRegister,
              variant: 'outline' as const
            }] : []),
            ...(onNavigateToHome ? [{
              key: 'home',
              label: 'דף הבית',
              icon: Home,
              onClick: onNavigateToHome,
              variant: 'ghost' as const
            }] : [])
          ]
        };

      case 'motivation':
        return {
          leftActions: canNavigateBack ? [
            {
              key: 'back-insights',
              label: 'חזור לתובנות',
              icon: ArrowLeft,
              onClick: onNavigateBack,
              variant: 'ghost' as const
            }
          ] : [],
          rightActions: [
            ...(onNavigateToResults ? [{
              key: 'results',
              label: 'צפה בתוצאות',
              icon: BarChart3,
              onClick: onNavigateToResults,
              variant: 'default' as const
            }] : []),
            ...(onShare ? [{
              key: 'share',
              label: 'שתף',
              icon: Share2,
              onClick: onShare,
              variant: 'outline' as const
            }] : []),
            ...(onNavigateToHome ? [{
              key: 'home',
              label: 'דף הבית',
              icon: Home,
              onClick: onNavigateToHome,
              variant: 'ghost' as const
            }] : [])
          ]
        };

      case 'results':
        return {
          leftActions: canNavigateBack && !isPollCompleted ? [
            {
              key: 'back-motivation',
              label: 'חזור למוטיבציה',
              icon: ArrowLeft,
              onClick: onNavigateBack,
              variant: 'ghost' as const
            }
          ] : [],
          rightActions: [
            ...(onShowDetailedResults ? [{
              key: 'detailed',
              label: 'תוצאות מפורטות',
              icon: Eye,
              onClick: onShowDetailedResults,
              variant: 'outline' as const
            }] : []),
            ...(onNavigateToInsights ? [{
              key: 'insights',
              label: 'התובנות שלי',
              icon: Brain,
              onClick: onNavigateToInsights,
              variant: 'outline' as const
            }] : []),
            ...(onNavigateToMotivation ? [{
              key: 'motivation',
              label: 'מניעים למעורבות',
              icon: Share2,
              onClick: onNavigateToMotivation,
              variant: 'outline' as const
            }] : []),
            ...(onNavigateToHome ? [{
              key: 'home',
              label: 'כל הסקרים',
              icon: Home,
              onClick: onNavigateToHome,
              variant: 'default' as const
            }] : [])
          ]
        };

      default:
        return { leftActions: [], rightActions: [] };
    }
  };

  const { leftActions, rightActions } = getNavigationContent();

  // Don't render if no actions available
  if (leftActions.length === 0 && rightActions.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`} dir="rtl">
      {/* Background with blur effect */}
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Actions */}
            <div className="flex items-center gap-2">
              {leftActions.map(({ key, label, icon: Icon, onClick, variant }) => (
                <Button
                  key={key}
                  onClick={onClick}
                  variant={variant}
                  size="lg"
                  className="hebrew-text font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Icon className="h-5 w-5 ml-2" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {rightActions.map(({ key, label, icon: Icon, onClick, variant }) => (
                <Button
                  key={key}
                  onClick={onClick}
                  variant={variant}
                  size="lg"
                  className={`hebrew-text font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${
                    variant === 'default' 
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl border-0'
                      : variant === 'outline'
                      ? 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white/50 backdrop-blur-sm'
                      : 'hover:bg-gray-100/80 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 ml-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer to prevent content overlap */}
      <div className="h-20"></div>
    </div>
  );
};