import React from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { StateNavigationBreadcrumb } from '@/components/StateNavigationBreadcrumb';
import { MinimalTopSection } from '@/components/MinimalTopSection';
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
  className = ""
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
            
            
            {/* State Navigation Breadcrumb */}
            {showBreadcrumb && (
              <StateNavigationBreadcrumb
                currentState={currentState}
                isPollCompleted={isPollCompleted}
                userVoteCount={userVoteCount}
                totalStatements={totalStatements}
              />
            )}

            {/* Universal Progress Section */}
            {showTopSection && (
              <MinimalTopSection
                poll={poll}
                isPollCompleted={isPollCompleted}
                onShareClick={onShareClick || (() => {})}
              />
            )}
          </div>
        )}
        
        {/* Main Content */}
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};