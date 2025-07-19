
import React from 'react';
import { useAuthTokenHandler } from '@/hooks/useAuthTokenHandler';

export const AuthTokenProcessor: React.FC = () => {
  const { isProcessing } = useAuthTokenHandler();

  if (!isProcessing) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">מאמת את החשבון שלך</h3>
        <p className="text-muted-foreground">אנא המתן בזמן שאנו מעבדים את האימות...</p>
      </div>
    </div>
  );
};
