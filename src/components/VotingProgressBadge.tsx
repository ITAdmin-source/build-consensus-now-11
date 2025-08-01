
import React from 'react';
import { Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VotingProgressBadgeProps {
  votedCount: number;
  totalCount: number;
  completionPercentage: number;
  isComplete: boolean;
  isStarted: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export const VotingProgressBadge: React.FC<VotingProgressBadgeProps> = ({
  votedCount,
  totalCount,
  completionPercentage,
  isComplete,
  isStarted,
  size = 'md',
  className,
  showTooltip = true
}) => {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-3 h-3', text: 'text-xs', stroke: 2, radius: 14 },
    md: { container: 'w-10 h-10', icon: 'w-4 h-4', text: 'text-sm', stroke: 2.5, radius: 18 },
    lg: { container: 'w-14 h-14', icon: 'w-6 w-6', text: 'text-base', stroke: 3, radius: 26 }
  };

  const sizeConfig = sizes[size];
  const circumference = 2 * Math.PI * sizeConfig.radius;
  
  // Ensure completion percentage is capped at 100% for ring calculation
  const cappedPercentage = Math.min(100, completionPercentage);
  const strokeDashoffset = circumference - (cappedPercentage / 100) * circumference;

  const getTooltipContent = () => {
    if (isComplete) return `הושלם! הצבעת על כל ${totalCount} ההיגדים`;
    if (isStarted) return `התקדמות: ${votedCount}/${totalCount} היגדים`;
    return `התחל להצביע על ${totalCount} היגדים`;
  };

  // Complete state - green checkmark (shows when voted >= total, even if over 100%)
  if (isComplete || (votedCount >= totalCount && totalCount > 0)) {
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:scale-105",
          sizeConfig.container,
          className
        )}
        title={showTooltip ? getTooltipContent() : undefined}
      >
        <Check className={cn(sizeConfig.icon, "animate-fade-in")} />
      </div>
    );
  }

  // In progress state - animated progress ring
  if (isStarted) {
    const svgSize = size === 'lg' ? 56 : size === 'md' ? 44 : 32;
    const center = svgSize / 2;
    
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center",
          sizeConfig.container,
          className
        )}
        title={showTooltip ? getTooltipContent() : undefined}
      >
        {/* Background circle */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90" 
          viewBox={`0 0 ${svgSize} ${svgSize}`}
        >
          <circle
            cx={center}
            cy={center}
            r={sizeConfig.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={sizeConfig.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-[#ec0081] transition-all duration-500 ease-out"
          />
        </svg>
        {/* Percentage text - always show capped percentage */}
        <span className={cn("font-bold text-[#1a305b] z-10", sizeConfig.text)}>
          {cappedPercentage}%
        </span>
      </div>
    );
  }

  // Not started state - gray circle with play icon
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gray-100 text-gray-500 border-2 border-gray-200 transition-all duration-300 hover:scale-105 hover:bg-gray-200",
        sizeConfig.container,
        className
      )}
      title={showTooltip ? getTooltipContent() : undefined}
    >
      <Play className={cn(sizeConfig.icon, "mr-0.5")} />
    </div>
  );
};
