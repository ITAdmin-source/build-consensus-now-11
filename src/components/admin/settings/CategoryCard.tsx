
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tags, Edit, Trash2 } from 'lucide-react';
import { Category } from '@/integrations/supabase/categories';

interface CategoryCardProps {
  category: Category;
  operationLoading: string | null;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  operationLoading,
  onEdit,
  onDelete
}) => {
  const isDeleteDisabled = operationLoading !== null || 
    (category.polls_count && category.polls_count > 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tags className="h-5 w-5 text-blue-500" />
            <div>
              <h4 className="font-medium">{category.name}</h4>
              <p className="text-sm text-muted-foreground">
                {category.polls_count || 0} סקרים
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(category)}
              disabled={operationLoading !== null}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete(category.category_id)}
              disabled={isDeleteDisabled}
            >
              {operationLoading === category.category_id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
