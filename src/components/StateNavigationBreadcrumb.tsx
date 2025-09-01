import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface StateNavigationBreadcrumbProps {
  currentState: 'voting' | 'insights' | 'motivation' | 'results';
  isPollCompleted?: boolean;
  userVoteCount?: number;
  totalStatements?: number;
  className?: string;
}

export const StateNavigationBreadcrumb: React.FC<StateNavigationBreadcrumbProps> = ({
  currentState,
  isPollCompleted = false,
  userVoteCount = 0,
  totalStatements = 0,
  className = ""
}) => {
  const states = [
    { key: 'voting', label: 'הצבעה', icon: Circle },
    { key: 'insights', label: 'תובנות', icon: Circle },
    { key: 'motivation', label: 'שיתוף', icon: Circle },
    { key: 'results', label: 'תוצאות', icon: Circle }
  ];

  const getCurrentStateIndex = () => {
    return states.findIndex(state => state.key === currentState);
  };

  const getStateStatus = (stateKey: string, index: number) => {
    const currentIndex = getCurrentStateIndex();
    
    if (isPollCompleted && stateKey === 'results') return 'current';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  const getProgressPercentage = () => {
    if (isPollCompleted) return 100;
    
    const currentIndex = getCurrentStateIndex();
    const baseProgress = (currentIndex / (states.length - 1)) * 100;
    
    // Add voting sub-progress for voting state
    if (currentState === 'voting' && totalStatements > 0) {
      const votingProgress = (userVoteCount / totalStatements) * (100 / states.length);
      return Math.min(baseProgress + votingProgress, 100);
    }
    
    return baseProgress;
  };

  return (
    <div className={`bg-white/60 backdrop-blur-sm border border-gray-100/50 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        {states.map((state, index) => {
          const status = getStateStatus(state.key, index);
          const Icon = status === 'completed' ? CheckCircle : 
                     status === 'current' ? Clock : Circle;
          
          return (
            <div key={state.key} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                status === 'current' 
                  ? 'bg-blue-100 text-blue-700 font-semibold' 
                  : status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-400'
              }`}>
                <Icon className={`h-4 w-4 ${
                  status === 'current' ? 'animate-pulse' : ''
                }`} />
                <span className="text-sm hebrew-text">{state.label}</span>
              </div>
              {index < states.length - 1 && (
                <div className="w-8 h-px bg-gray-200 mx-2" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="relative">
        <Progress 
          value={getProgressPercentage()} 
          className="h-2 bg-gray-200/70 rounded-full overflow-hidden" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" />
      </div>
    </div>
  );
};