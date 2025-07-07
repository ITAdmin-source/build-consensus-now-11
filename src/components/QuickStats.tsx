
import React from 'react';
import { Poll } from '@/types/poll';
import { Gamepad2, Trophy, Star, Medal } from 'lucide-react';

interface QuickStatsProps {
  polls: Poll[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ polls }) => {
  const activeGames = polls.filter(p => p.status === 'active').length;
  const totalVictoryPoints = polls.reduce((sum, p) => sum + p.current_consensus_points, 0);
  const totalMoves = polls.reduce((sum, p) => sum + p.total_votes, 0);
  const collectiveWins = polls.filter(p => p.current_consensus_points >= p.min_consensus_points_to_win).length;

  const stats = [
    {
      icon: Gamepad2,
      value: activeGames,
      label: 'משחקים פעילים',
      color: 'from-[#1a305b] to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-[#1a305b]'
    },
    {
      icon: Star,
      value: totalVictoryPoints,
      label: 'נקודות זכייה',
      color: 'from-[#66c8ca] to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-[#66c8ca]'
    },
    {
      icon: Medal,
      value: totalMoves,
      label: 'מהלכים',
      color: 'from-[#ec0081] to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-[#ec0081]'
    },
    {
      icon: Trophy,
      value: collectiveWins,
      label: 'ניצחונות קבוצתיים',
      color: 'from-orange-500 to-yellow-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={index}
                className={`${stat.bgColor} rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-100`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 ${stat.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium hebrew-text">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
