
import React, { useState, useEffect } from 'react';

interface PointAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export const PointAnimation: React.FC<PointAnimationProps> = ({ show, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes pointFloat {
          0% {
            transform: scale(0.8) translateY(20px);
            opacity: 0;
          }
          20% {
            transform: scale(1.1) translateY(0px);
            opacity: 1;
          }
          80% {
            transform: scale(1.1) translateY(-10px);
            opacity: 1;
          }
          100% {
            transform: scale(0.9) translateY(-30px);
            opacity: 0;
          }
        }
        .point-float-animation {
          animation: pointFloat 2s ease-out forwards;
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
        <div 
          className={`
            bg-gradient-to-r from-yellow-400 to-orange-500 text-white 
            px-4 py-2 rounded-full font-bold text-lg shadow-lg
            transform transition-all duration-200 ease-out point-float-animation
          `}
        >
          <div className="flex items-center gap-2 hebrew-text">
            <span className="text-2xl">🏆</span>
            <span>+1 נקודה!</span>
          </div>
        </div>
      </div>
    </>
  );
};
