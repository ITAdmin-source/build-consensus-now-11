import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Users, CheckCircle } from 'lucide-react';

interface ConsensusPointsSummaryProps {
  totalVotes: number;
  consensusPointsCount: number;
  participantCount: number;
}

export const ConsensusPointsSummary: React.FC<ConsensusPointsSummaryProps> = ({
  totalVotes,
  consensusPointsCount,
  participantCount
}) => {
  return (
    <div className="text-center space-y-4">
      {/* Completion Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <CheckCircle className="h-6 w-6 text-green-600" />
        <h3 className="text-xl font-bold hebrew-text text-green-600">
          הסקר הסתיים!
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Votes */}
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {totalVotes.toLocaleString()}
          </div>
          <div className="text-sm text-blue-700 hebrew-text">סה"כ הצבעות</div>
        </div>

        {/* Participants */}
        <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-1">
            <Users className="h-5 w-5 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {participantCount.toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-green-700 hebrew-text">משתתפים</div>
        </div>

        {/* Consensus Points */}
        <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-amber-600 fill-current" />
            <div className="text-2xl font-bold text-amber-600">
              {consensusPointsCount}
            </div>
          </div>
          <div className="text-sm text-amber-700 hebrew-text">נקודות הסכמה</div>
        </div>
      </div>

      {/* Consensus Achievement Badge */}
      {consensusPointsCount > 0 && (
        <div className="flex justify-center mt-4">
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 px-4 py-2"
          >
            <Star className="h-4 w-4 fill-current mr-2" />
            <span className="hebrew-text">
              {consensusPointsCount > 5 
                ? "הסכמה גבוהה בקהילה!" 
                : consensusPointsCount > 2 
                  ? "הסכמה טובה נמצאה"
                  : "נמצאו נקודות הסכמה"
              }
            </span>
          </Badge>
        </div>
      )}
    </div>
  );
};