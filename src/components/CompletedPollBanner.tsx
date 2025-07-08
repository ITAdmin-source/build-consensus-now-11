
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types/poll';
import { Trophy, Calendar, Users, Target, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletedPollBannerProps {
  poll: Poll;
}

export const CompletedPollBanner: React.FC<CompletedPollBannerProps> = ({ poll }) => {
  const isWinning = poll.current_consensus_points >= poll.min_consensus_points_to_win;
  const completionDate = poll.round?.end_time ? new Date(poll.round.end_time).toLocaleDateString('he-IL') : 'לא ידוע';
  
  const handleExportResults = () => {
    // TODO: Implement export functionality
    console.log('Export results for poll:', poll.poll_id);
  };

  const handleShareResults = () => {
    // TODO: Implement share functionality
    console.log('Share results for poll:', poll.poll_id);
  };

  return isWinning ? (
    <Card className="bg-gradient-to-r from-green-100 via-emerald-50 to-blue-100 border-green-300 shadow-lg">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-12 w-12 text-green-600 animate-bounce" />
            <Badge variant="secondary" className="bg-green-200 text-green-800 text-lg px-6 py-2">
              הסקר הושלם בהצלחה
            </Badge>
          </div>
          
          <h2 className="text-3xl font-bold text-green-800 hebrew-text mb-2">
            🎉 ניצחון קבוצתי הושג! 🎉
          </h2>
          
          <p className="text-lg text-green-700 hebrew-text mb-4">
            הקהילה מצאה {poll.current_consensus_points} מתוך {poll.min_consensus_points_to_win} נקודות חיבור נדרשות
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 hebrew-text">הושלם ב-{completionDate}</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 hebrew-text">{poll.total_participants} משתתפים</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 hebrew-text">{poll.total_votes} הצבעות</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Trophy className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 hebrew-text">{poll.current_consensus_points} נקודות חיבור</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              onClick={handleExportResults}
              variant="outline"
              size="sm"
              className="hebrew-text"
            >
              <Download className="h-4 w-4 ml-2" />
              הורד תוצאות
            </Button>
            <Button
              onClick={handleShareResults}
              variant="outline"
              size="sm"
              className="hebrew-text"
            >
              <Share2 className="h-4 w-4 ml-2" />
              שתף תוצאות
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 border-blue-300 shadow-lg">
      <CardContent className="p-6">
        <div className="text-center space-y-3">
          <Badge variant="secondary" className="bg-blue-200 text-blue-800 text-base px-4 py-1">
            הסקר הסתיים
          </Badge>
          
          <h2 className="text-2xl font-bold text-blue-800 hebrew-text">
            התוצאות הסופיות
          </h2>
          
          <p className="text-blue-700 hebrew-text">
            הסקר הסתיים ב-{completionDate} • {poll.current_consensus_points}/{poll.min_consensus_points_to_win} נקודות חיבור נמצאו
          </p>

          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              onClick={handleExportResults}
              variant="outline"
              size="sm"
              className="hebrew-text"
            >
              <Download className="h-4 w-4 ml-2" />
              הורד תוצאות
            </Button>
            <Button
              onClick={handleShareResults}
              variant="outline"
              size="sm"
              className="hebrew-text"
            >
              <Share2 className="h-4 w-4 ml-2" />
              שתף תוצאות
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
