
import React from 'react';

interface GameParticlesProps {
  count?: number;
  className?: string;
}

export const GameParticles: React.FC<GameParticlesProps> = ({ 
  count = 6, 
  className = "" 
}) => {
  const particles = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 bg-gradient-to-r from-[#66c8ca] to-[#ec0081] rounded-full opacity-30 animate-particle-float ${className}`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${3 + Math.random() * 4}s`
      }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};
