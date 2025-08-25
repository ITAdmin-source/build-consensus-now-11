import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  show: boolean;
  duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ show, duration = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-[confetti_3s_ease-out_forwards] w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#ec0081', '#66c8ca', '#1a305b', '#fbbf24', '#10b981'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};