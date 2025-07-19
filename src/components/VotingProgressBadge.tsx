
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
    sm: { container: 'w-8 h-8', icon: 'w-3 h-3', text: 'text-xs', stroke: 2 },
    md: { container: 'w-10 h-10', icon: 'w-4 h-4', text: 'text-sm', stroke: 2.5 },
    lg: { container: 'w-12 h-12', icon: 'w-5 h-5', text: 'text-base', stroke: 3 }
  };

  const sizeConfig = sizes[size];
  const radius = size === 'sm' ? 14 : size === 'md' ? 18 : 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  const getTooltipContent = () => {
    if (isComplete) return `הושלם! הצבעת על כל ${totalCount} ההיגדים`;
    if (isStarted) return `התקדמות: ${votedCount}/${totalCount} היגדים`;
    return `התחל להצביע על ${totalCount} היגדים`;
  };

  // Complete state - green checkmark
  if (isComplete) {
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
          viewBox="0 0 44 44"
        >
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-[#ec0081] transition-all duration-500 ease-out"
          />
        </svg>
        {/* Percentage text */}
        <span className={cn("font-bold text-[#1a305b] z-10", sizeConfig.text)}>
          {completionPercentage}%
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
