
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface PowerButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  variant: 'support' | 'unsure' | 'oppose';
  disabled?: boolean;
  isActive?: boolean;
  className?: string;
}

export const PowerButton: React.FC<PowerButtonProps> = ({
  onClick,
  icon: Icon,
  label,
  variant,
  disabled = false,
  isActive = false,
  className = ""
}) => {
  const getVariantStyles = () => {
    const baseStyles = "power-button h-16 text-lg font-bold transition-all duration-300 transform";
    
    switch (variant) {
      case 'support':
        return `${baseStyles} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white game-button-glow hover:shadow-green-400/50`;
      case 'unsure':
        return `${baseStyles} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white game-button-glow hover:shadow-yellow-400/50`;
      case 'oppose':
        return `${baseStyles} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white game-button-glow hover:shadow-red-400/50`;
      default:
        return baseStyles;
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${getVariantStyles()} ${isActive ? 'ring-4 ring-white/50 scale-105' : ''} ${className}`}
      size="lg"
    >
      <Icon className="h-6 w-6 ml-2" />
      <span className="hebrew-text">{label}</span>
    </Button>
  );
};
