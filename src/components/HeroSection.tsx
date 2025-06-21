
import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 hebrew-text">
          נקודות חיבור
        </h1>
        <p className="text-lg md:text-xl mb-4 hebrew-text leading-relaxed">
          שחקו ברצינות - בנו הסכמה אמיתית
        </p>
        <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto hebrew-text leading-relaxed">
          אתם זוכים רק אם כולם זוכים. הזמן אוזל. עזרו לבנות קונצנזוס בחברה הישראלית.
        </p>
      </div>
    </div>
  );
};
