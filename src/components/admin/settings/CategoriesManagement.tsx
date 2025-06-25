import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tags, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/admin/ConfirmationDialog';
import { CategoryCard } from './CategoryCard';
import { CategoryDialog } from './CategoryDialog';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  type Category 
} from '@/integrations/supabase/categories';

export const CategoriesManagement: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({ isOpen: false, categoryId: '', categoryName: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      console.log('Fetching categories from database...');
      const categoriesData = await fetchCategories();
      console.log('Categories loaded:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategoriesError('שגיאה בטעינת קטגוריות מהמסד נתונים');
      setCategories([]);
      toast({
        title: 'שגיאה בטעינת קטגוריות',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      setOperationLoading('add');
      console.log('Creating new category:', name);
      const newCategory = await createCategory(name);
      console.log('Category created:', newCategory);
      setCategories([...categories, newCategory]);
      setShowNewCategoryDialog(false);
      
      toast({
        title: 'קטגוריה נוספה',
        description: `הקטגוריה "${name}" נוספה בהצלחה`,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'שגיאה בהוספת קטגוריה',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleEditCategory = async (name: string) => {
    if (!editingCategory) return;
    
    try {
      setOperationLoading('edit');
      console.log('Updating category:', editingCategory);
      await updateCategory(editingCategory.id, name);
      setCategories(categories.map(cat => 
        cat.category_id === editingCategory.id 
          ? { ...cat, name: name }
          : cat
      ));
      setEditingCategory(null);
      
      toast({
        title: 'קטגוריה עודכנה',
        description: 'הקטגוריה עודכנה בהצלחה',
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'שגיאה בעדכון קטגוריה',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    if (!category) return;

    if (category.polls_count && category.polls_count > 0) {
      toast({
        title: 'לא ניתן למחוק',
        description: 'לא ניתן למחוק קטגוריה שיש בה סקרים פעילים',
        variant: 'destructive',
      });
      return;
    }

    setDeleteConfirmation({
      isOpen: true,
      categoryId,
      categoryName: category.name
    });
  };

  const confirmDeleteCategory = async () => {
    try {
      setOperationLoading(deleteConfirmation.categoryId);
      console.log('Deleting category:', deleteConfirmation.categoryId);
      await deleteCategory(deleteConfirmation.categoryId);
      setCategories(categories.filter(c => c.category_id !== deleteConfirmation.categoryId));
      setDeleteConfirmation({ isOpen: false, categoryId: '', categoryName: '' });
      toast({
        title: 'קטגוריה נמחקה',
        description: 'הקטגוריה נמחקה בהצלחה',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'שגיאה במחיקת קטגוריה',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleEditCategoryClick = (category: Category) => {
    setEditingCategory({ id: category.category_id, name: category.name });
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ניהול קטגוריות</h3>
        <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
          <DialogTrigger asChild>
            <Button disabled={operationLoading !== null}>
              <Plus className="h-4 w-4 ml-1" />
              קטגוריה חדשה
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {categoriesError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{categoriesError}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadCategories}
                className="mr-auto"
                disabled={categoriesLoading}
              >
                {categoriesLoading ? 'טוען...' : 'נסה שוב'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {categories.length === 0 && !categoriesError ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Tags className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium">אין קטגוריות במערכת</p>
            <p className="text-muted-foreground mb-4">צור קטגוריה חדשה כדי להתחיל</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.category_id}
              category={category}
              operationLoading={operationLoading}
              onEdit={handleEditCategoryClick}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>
      )}

      {/* Add Category Dialog */}
      <CategoryDialog
        isOpen={showNewCategoryDialog}
        onOpenChange={setShowNewCategoryDialog}
        onSave={handleAddCategory}
        existingCategories={categories}
        operationLoading={operationLoading === 'add'}
        title="הוספת קטגוריה חדשה"
        saveButtonText="הוסף"
      />

      {/* Edit Category Dialog */}
      <CategoryDialog
        isOpen={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSave={handleEditCategory}
        existingCategories={categories}
        editingCategory={editingCategory}
        operationLoading={operationLoading === 'edit'}
        title="עריכת קטגוריה"
        saveButtonText="עדכן"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}
        title="מחיקת קטגוריה"
        description={`האם אתה בטוח שברצונך למחוק את הקטגוריה "${deleteConfirmation.categoryName}"?`}
        confirmText="מחק"
        cancelText="ביטול"
        variant="destructive"
        onConfirm={confirmDeleteCategory}
        isLoading={operationLoading === deleteConfirmation.categoryId}
      />
    </div>
  );
};
