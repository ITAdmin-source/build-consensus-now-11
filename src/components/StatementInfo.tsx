import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatementInfoProps {
  moreInfo: string;
  className?: string;
}

export const StatementInfo: React.FC<StatementInfoProps> = ({ 
  moreInfo, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 ${className}`}
        aria-label="מידע נוסף על ההצהרה"
      >
        <Info className="h-4 w-4" />
      </Button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 hebrew-text text-right">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-4 left-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              aria-label="סגור"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Content */}
            <div className="space-y-4" dir="rtl">
              <h4 className="font-semibold text-xl text-gray-900">מידע נוסף</h4>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {moreInfo}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};