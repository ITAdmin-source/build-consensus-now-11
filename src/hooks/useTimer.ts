
import { useState, useEffect } from 'react';

export type TimerPhase = 'calm' | 'notice' | 'caution' | 'critical' | 'final';

export interface TimerState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  phase: TimerPhase;
  totalSeconds: number;
}

export const useTimer = (endTime: string): TimerState => {
  const [timeLeft, setTimeLeft] = useState<TimerState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    phase: 'calm',
    totalSeconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference > 0) {
        const totalSeconds = Math.floor(difference / 1000);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Calculate urgency phase
        let phase: TimerPhase;
        if (totalSeconds > 172800) { // >2 days
          phase = 'calm';
        } else if (totalSeconds > 21600) { // 6-48 hours
          phase = 'notice';
        } else if (totalSeconds > 7200) { // 2-6 hours
          phase = 'caution';
        } else if (totalSeconds > 1800) { // 30min-2 hours
          phase = 'critical';
        } else { // <30 minutes
          phase = 'final';
        }

        setTimeLeft({ days, hours, minutes, seconds, isExpired: false, phase, totalSeconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, phase: 'calm', totalSeconds: 0 });
      }
    };

    calculateTimeLeft();
    
    // Dynamic update intervals based on urgency
    let interval = 60000; // 1 minute default
    const tempEnd = new Date(endTime).getTime();
    const tempNow = new Date().getTime();
    const tempDiff = tempEnd - tempNow;
    const tempTotalSeconds = Math.floor(tempDiff / 1000);
    
    if (tempTotalSeconds <= 1800) { // <30 minutes
      interval = 1000; // Every second
    } else if (tempTotalSeconds <= 7200) { // <2 hours
      interval = 10000; // Every 10 seconds
    } else if (tempTotalSeconds <= 21600) { // <6 hours
      interval = 30000; // Every 30 seconds
    }

    const timer = setInterval(calculateTimeLeft, interval);
    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
};
