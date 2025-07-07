
import React, { useState, useEffect } from 'react';
import { PollCard } from '@/components/PollCard';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types/poll';
import { fetchActivePollCategories, CategoryWithPollCount } from '@/integrations/supabase/categories';
import { toast } from 'sonner';
import { Gamepad2, Zap } from 'lucide-react';

interface PollsGridProps {
  polls: Poll[];
  onJoinPoll: (pollId: string) => void;
}

export const PollsGrid: React.FC<PollsGridProps> = ({ polls, onJoinPoll }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');
  const [categories, setCategories] = useState<CategoryWithPollCount[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await fetchActivePollCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('שגיאה בטעינת הקטגוריות');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Create categories list with "הכל" at the beginning, only showing categories with active polls
  const categoryOptions = ['הכל', ...categories.map(cat => cat.name)];
  
  const filteredPolls = polls.filter(poll => {
    const matchesSearch = searchQuery === '' || 
      poll.title.includes(searchQuery) || 
      poll.description.includes(searchQuery);
    const matchesCategory = selectedCategory === 'הכל' || poll.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Gaming Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#1a305b] to-[#ec0081] rounded-full flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold hebrew-text bg-gradient-to-r from-[#1a305b] via-[#ec0081] to-[#66c8ca] bg-clip-text text-transparent">
            🎮 משחקים פעילים 🏆
          </h2>
          <div className="w-12 h-12 bg-gradient-to-r from-[#ec0081] to-[#66c8ca] rounded-full flex items-center justify-center">
            <Zap className="h-6 w-6 text-white animate-pulse" />
          </div>
        </div>
        
        <p className="text-lg text-gray-600 hebrew-text mb-8 max-w-2xl mx-auto">
          בחרו משחק והתחילו לשחק! כל משחק הוא אתגר חברתי לבניית הסכמה.
        </p>
        
        {/* Gaming Filter */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categoriesLoading ? (
              <div className="text-sm text-gray-500 hebrew-text animate-pulse">טוען קטגוריות משחק...</div>
            ) : categoryOptions.length > 1 ? (
              categoryOptions.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium hebrew-text transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#1a305b] to-[#ec0081] text-white shadow-lg scale-105'
                      : 'hover:bg-gradient-to-r hover:from-[#1a305b] hover:to-[#ec0081] hover:text-white hover:scale-105'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'הכל' ? '🎯 ' : '🎮 '}
                  {category}
                </Badge>
              ))
            ) : (
              <div className="text-sm text-gray-500 hebrew-text">אין קטגוריות זמינות</div>
            )}
          </div>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPolls.map((poll) => (
          <PollCard
            key={poll.poll_id}
            poll={poll}
            onJoinPoll={onJoinPoll}
          />
        ))}
      </div>

      {filteredPolls.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Gamepad2 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 hebrew-text text-lg">
            אין משחקים זמינים בקטגוריה זו כרגע
          </p>
        </div>
      )}
    </div>
  );
};
