
import React, { useState, useEffect } from 'react';
import { PollCard } from '@/components/PollCard';
import { Badge } from '@/components/ui/badge';
import { Poll } from '@/types/poll';
import { fetchActivePollCategories, CategoryWithPollCount } from '@/integrations/supabase/categories';
import { toast } from 'sonner';

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
    <div className="container mx-auto px-4 py-8">
      {/* Header & Search */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 hebrew-text">
          סקרים פעילים
        </h2>
        
        {/* Filter */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categoriesLoading ? (
              <div className="text-sm text-muted-foreground hebrew-text">טוען קטגוריות...</div>
            ) : categoryOptions.length > 1 ? (
              categoryOptions.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))
            ) : (
              <div className="text-sm text-muted-foreground hebrew-text">אין קטגוריות זמינות</div>
            )}
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
