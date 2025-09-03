import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { StateNavigationBreadcrumb } from '@/components/StateNavigationBreadcrumb';
import { MinimalTopSection } from '@/components/MinimalTopSection';
import { UnifiedNavigationBar } from '@/components/UnifiedNavigationBar';
import { Poll } from '@/types/poll';
import { UserPoints } from '@/integrations/supabase/userPoints';

interface UnifiedLayoutWrapperProps {
  children: React.ReactNode;
  poll: Poll;
  userPoints?: UserPoints;
  currentState: 'voting' | 'insights' | 'motivation' | 'results';
  containerWidth?: 'narrow' | 'wide' | 'full';
  showTopSection?: boolean;
  showBreadcrumb?: boolean;
  isPollCompleted?: boolean;
  userVoteCount?: number;
  totalStatements?: number;
  onShareClick?: () => void;
  className?: string;
  
  // Navigation props
  isAuthenticated?: boolean;
  canNavigateBack?: boolean;
  onNavigateToHome?: () => void;
  onNavigateToInsights?: () => void;
  onNavigateToMotivation?: () => void;
  onNavigateToResults?: () => void;
  onNavigateBack?: () => void;
  onShare?: () => void;
  onRegister?: () => void;
  onEndEarly?: () => void;
  onShowDetailedResults?: () => void;
}

export const UnifiedLayoutWrapper: React.FC<UnifiedLayoutWrapperProps> = ({
  children,
  poll,
  userPoints,
  currentState,
  containerWidth = 'narrow',
  showTopSection = true,
  showBreadcrumb = true,
  isPollCompleted = false,
  userVoteCount = 0,
  totalStatements = 0,
  onShareClick,
  className = "",
  
  // Navigation props
  isAuthenticated = false,
  canNavigateBack = false,
  onNavigateToHome,
  onNavigateToInsights,
  onNavigateToMotivation,
  onNavigateToResults,
  onNavigateBack,
  onShare,
  onRegister,
  onEndEarly,
  onShowDetailedResults
}) => {
  const getContainerClass = () => {
    switch (containerWidth) {
      case 'narrow': return 'max-w-2xl';
      case 'wide': return 'max-w-4xl';
      case 'full': return 'max-w-7xl';
      default: return 'max-w-2xl';
    }
  };

  const getNavPage = () => {
    if (currentState === 'voting') return 'voting';
    return 'results';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${className}`} dir="rtl">
      {/* Primary Header */}
      <NavigationHeader 
        currentPage={getNavPage()} 
        userPoints={userPoints} 
        poll={poll} 
      />
      
      <div className={`container mx-auto px-4 py-6 ${getContainerClass()}`}>
        {/* Secondary Header with Progress and Breadcrumb */}
        {(showTopSection || showBreadcrumb) && (
          <div className="space-y-4 mb-6">
            {/* Universal Progress Section */}
            {showTopSection && (
              <MinimalTopSection
                poll={poll}
                isPollCompleted={isPollCompleted}
                onShareClick={onShareClick || (() => {})}
              />
            )}
            
            {/* State Navigation Breadcrumb */}
            {showBreadcrumb && (
              <StateNavigationBreadcrumb
                currentState={currentState}
                isPollCompleted={isPollCompleted}
                userVoteCount={userVoteCount}
                totalStatements={totalStatements}
              />
            )}
          </div>
        )}
        
        {/* Main Content */}
        <div className="animate-fade-in pb-24">
          {children}
        </div>
      </div>
      
      {/* Unified Navigation Bar */}
      <UnifiedNavigationBar
        currentState={currentState}
        isAuthenticated={isAuthenticated}
        isPollCompleted={isPollCompleted}
        canNavigateBack={canNavigateBack}
        onNavigateToHome={onNavigateToHome}
        onNavigateToInsights={onNavigateToInsights}
        onNavigateToMotivation={onNavigateToMotivation}
        onNavigateToResults={onNavigateToResults}
        onNavigateBack={onNavigateBack}
        onShare={onShare || onShareClick}
        onRegister={onRegister}
        onEndEarly={onEndEarly}
        onShowDetailedResults={onShowDetailedResults}
      />
    </div>
  );
};