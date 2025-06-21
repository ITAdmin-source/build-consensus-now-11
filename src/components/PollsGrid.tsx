
import React, { useState } from 'react';
import { PollCard } from '@/components/PollCard';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types/poll';

interface PollsGridProps {
  polls: Poll[];
  onJoinPoll: (pollId: string) => void;
}

export const PollsGrid: React.FC<PollsGridProps> = ({ polls, onJoinPoll }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');

  const categories = ['הכל', 'חינוך', 'חברה', 'סביבה'];
  
  const filteredPolls = polls.filter(poll => {
    const matchesSearch = searchQuery === '' || 
      poll.title.includes(searchQuery) || 
      poll.description.includes(searchQuery);
    const matchesCategory = selectedCategory === 'הכל' || poll.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header & Search */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 hebrew-text">
          סקרים פעילים
        </h2>
        
        {/* Filter */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Polls Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredPolls.map((poll) => (
          <PollCard
            key={poll.poll_id}
            poll={poll}
            onJoinPoll={onJoinPoll}
          />
        ))}
      </div>
    </div>
  );
};
