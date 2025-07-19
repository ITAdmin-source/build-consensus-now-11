
import React from 'react';
import { useTimer, TimerPhase } from '@/hooks/useTimer';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  endTime, 
  className = '', 
  showIcon = true,
  compact = false 
}) => {
  const { days, hours, minutes, seconds, isExpired, phase, totalSeconds } = useTimer(endTime);

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 text-red-500 font-bold ${className}`}>
        {showIcon && <Clock className="h-4 w-4" />}
        <span>הזמן נגמר</span>
      </div>
    );
  }

  const getPhaseStyles = (phase: TimerPhase) => {
    switch (phase) {
      case 'calm':
        return 'timer-calm text-sm';
      case 'notice':
        return 'timer-notice text-sm';
      case 'caution':
        return 'timer-caution text-base';
      case 'critical':
        return 'timer-critical text-base';
      case 'final':
        return 'timer-final text-lg';
      default:
        return 'timer-calm text-sm';
    }
  };

  const getTimeDisplay = (phase: TimerPhase) => {
    switch (phase) {
      case 'calm':
        return days > 0 ? `${days}ד ${hours}ש` : `${hours}ש ${minutes}ד`;
      case 'notice':
        return days > 0 ? `${days}ד ${hours}ש` : `${hours}ש ${minutes}ד`;
      case 'caution':
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      case 'critical':
        return `${(hours * 60 + minutes).toString()}:${seconds.toString().padStart(2, '0')}`;
      case 'final':
        return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
      default:
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
  };

  if (compact) {
    return (
      <div className={`font-mono ${getPhaseStyles(phase)} ${className}`}>
        {getTimeDisplay(phase)}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${getPhaseStyles(phase)} ${className}`}>
      {showIcon && <Clock className="h-4 w-4" />}
      <div className="font-mono">
        {getTimeDisplay(phase)}
      </div>
    </div>
  );
};
