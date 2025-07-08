
import React from 'react';
import { Poll } from '@/types/poll';
import { getPollStatus } from '@/utils/pollStatusUtils';
import { Gamepad2, Trophy, Star, Medal } from 'lucide-react';

interface QuickStatsProps {
  polls: Poll[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ polls }) => {
  const activeGames = polls.filter(p => {
    const status = getPollStatus(p);
    return status === 'active' || status === 'pending';
  }).length;
  
  const totalVictoryPoints = polls.reduce((sum, p) => sum + p.current_consensus_points, 0);
  const totalMoves = polls.reduce((sum, p) => sum + p.total_votes, 0);
  const collectiveWins = polls.filter(p => p.current_consensus_points >= p.min_consensus_points_to_win).length;

  const stats = [
    {
      icon: Gamepad2,
      value: activeGames,
      label: 'משחקים פעילים',
      color: '#1a305b',
      bgColor: 'bg-blue-50',
      borderColor: 'border-[#1a305b]/20'
    },
    {
      icon: Star,
      value: totalVictoryPoints,
      label: 'נקודות חיבור',
      color: '#66c8ca',
      bgColor: 'bg-teal-50',
      borderColor: 'border-[#66c8ca]/20'
    },
    {
      icon: Medal,
      value: totalMoves,
      label: 'הצבעות',
      color: '#ec0081',
      bgColor: 'bg-pink-50',
      borderColor: 'border-[#ec0081]/20'
    },
    {
      icon: Trophy,
      value: collectiveWins,
      label: 'ניצחונות קבוצתיים',
      color: '#f59e0b',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300'
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
                className={`${stat.bgColor} rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${stat.borderColor}`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 ${stat.bgColor} rounded-full flex items-center justify-center shadow-lg border ${stat.borderColor}`}>
                  <IconComponent className="h-6 w-6" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: stat.color }}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium text-center">
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
