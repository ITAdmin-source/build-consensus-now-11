
import React from 'react';
import { useTimer } from '@/hooks/useTimer';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;
  className?: string;
  showIcon?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  endTime, 
  className = '', 
  showIcon = true 
}) => {
  const { days, hours, minutes, seconds, isExpired } = useTimer(endTime);

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 text-red-500 font-bold ${className}`}>
        {showIcon && <Clock className="h-4 w-4" />}
        <span>הזמן נגמר</span>
      </div>
    );
  }

  const isUrgent = days === 0 && hours < 2;

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? 'timer-urgent' : 'text-gray-600'} ${className}`}>
      {showIcon && <Clock className="h-4 w-4" />}
      <div className="flex gap-1 font-mono">
        {days > 0 && <span>{days}ד</span>}
        <span>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};
