
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HowItWorksContent } from '@/components/HowItWorksContent';

export const HowItWorks: React.FC = () => {
  return (
    <Card className="max-w-5xl mx-auto shadow-xl border-2 border-gray-100">
      <CardContent className="p-0">
        <HowItWorksContent showCard={false} />
      </CardContent>
    </Card>
  );
};
