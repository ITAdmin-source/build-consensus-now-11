
import React, { useState, useEffect } from 'react';
import { PollSection } from '@/components/PollSection';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types/poll';
import { fetchActivePollCategories, CategoryWithPollCount } from '@/integrations/supabase/categories';
import { getPollStatus } from '@/utils/pollStatusUtils';
import { toast } from 'sonner';
import { Gamepad2, Trophy, Clock, Target } from 'lucide-react';

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

  // Categorize polls based on their status and round status
  const categorizePoll = (poll: Poll) => {
    const pollStatus = getPollStatus(poll);
    
    // Check round status first
    if (poll.round?.active_status === 'pending') {
      return 'pending';
    }
    if (poll.round?.active_status === 'completed' || pollStatus === 'completed') {
      return 'completed';
    }
    if (poll.round?.active_status === 'active' && pollStatus === 'active') {
      return 'active';
    }
    // Default to pending if unclear
    return 'pending';
  };

  // Filter polls by search and category first
  const filteredPolls = polls.filter(poll => {
    const matchesSearch = searchQuery === '' || 
      poll.title.includes(searchQuery) || 
      poll.description.includes(searchQuery);
    const matchesCategory = selectedCategory === 'הכל' || poll.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Then categorize the filtered polls
  const activePolls = filteredPolls.filter(poll => categorizePoll(poll) === 'active');
  const completedPolls = filteredPolls.filter(poll => categorizePoll(poll) === 'completed');
  const pendingPolls = filteredPolls.filter(poll => categorizePoll(poll) === 'pending');

  // Create categories list with "הכל" at the beginning
  const categoryOptions = ['הכל', ...categories.map(cat => cat.name)];
  
  // Check if we have any polls to show
  const hasAnyPolls = activePolls.length > 0 || completedPolls.length > 0 || pendingPolls.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Main Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-[#ec0081] to-[#66c8ca] rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold hebrew-text bg-gradient-to-r from-[#ec0081] to-[#66c8ca] bg-clip-text text-transparent">
            🎮 משחקי הסכמה 🏆
          </h1>
        </div>
        
        <p className="text-xl text-gray-600 hebrew-text mb-8 max-w-3xl mx-auto">
          גלו משחקים פעילים שתוכלו לשחק בהם כעת, צפו בתוצאות של משחקים שהסתיימו, והכינו את עצמכם למשחקים שבקרוב יגיעו!
        </p>
        
        {/* Category Filter */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categoriesLoading ? (
              <div className="text-sm text-gray-500 hebrew-text animate-pulse">טוען קטגוריות...</div>
            ) : categoryOptions.length > 1 ? (
              categoryOptions.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium hebrew-text transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-[#66c8ca] text-white shadow-lg scale-105 border-[#66c8ca]'
                      : 'hover:bg-[#66c8ca] hover:text-white hover:scale-105 border-[#66c8ca]/30'
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

      {/* Poll Sections */}
      {hasAnyPolls ? (
        <div className="space-y-16">
          {/* Active Polls - Highest Priority */}
          <PollSection
            title="🎮 משחקים פעילים - שחקו עכשיו!"
            subtitle="משחקים שאתם יכולים לשחק בהם כרגע ולהשפיע על התוצאות"
            polls={activePolls}
            onJoinPoll={onJoinPoll}
            sectionType="active"
            icon={<Gamepad2 className="h-6 w-6 text-white" />}
          />

          {/* Completed Polls */}
          <PollSection
            title="🏆 משחקים שהסתיימו - צפו בתוצאות"
            subtitle="גלו איך הקהילה הצביעה ומה הוחלט יחד"
            polls={completedPolls}
            onJoinPoll={onJoinPoll}
            sectionType="completed"
            icon={<Trophy className="h-6 w-6 text-white" />}
          />

          {/* Pending Polls */}
          <PollSection
            title="⏰ משחקים בקרוב - הכינו את עצמכם"
            subtitle="משחקים מרגשים שיפתחו בקרוב - עקבו אחרי העדכונים!"
            polls={pendingPolls}
            onJoinPoll={onJoinPoll}
            sectionType="pending"
            icon={<Clock className="h-6 w-6 text-white" />}
          />
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Gamepad2 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 hebrew-text mb-4">
            אין משחקים זמינים בקטגוריה זו כרגע
          </h3>
          <p className="text-gray-500 hebrew-text text-lg">
            נסו לבחור קטגוריה אחרת או חזרו מאוחר יותר
          </p>
        </div>
      )}
    </div>
  );
};
