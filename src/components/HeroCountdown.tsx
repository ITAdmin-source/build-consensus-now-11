
import React from 'react';
import { useTimer } from '@/hooks/useTimer';

interface HeroCountdownProps {
  endTime: string;
  title: string;
  subtitle: string;
}

export const HeroCountdown: React.FC<HeroCountdownProps> = ({ endTime, title, subtitle }) => {
  const { days, hours, minutes, seconds, isExpired } = useTimer(endTime);

  if (isExpired) {
    return null;
  }

  const timeUnits = [
    { value: days, label: 'ימים' },
    { value: hours, label: 'שעות' },
    { value: minutes, label: 'דקות' },
    { value: seconds, label: 'שניות' }
  ];

  return (
    <div className="text-center">
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 hebrew-text">
        {title}
      </h3>
      <p className="text-[#66c8ca] text-lg mb-8 hebrew-text">
        {subtitle}
      </p>
      
      <div className="flex justify-center items-center gap-4 md:gap-6">
        {timeUnits.map((unit, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl md:text-3xl font-bold text-[#1a305b]">
                {unit.value.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-white text-sm md:text-base font-medium mt-2 hebrew-text">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
