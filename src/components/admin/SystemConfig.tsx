
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Settings, 
  Tags, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchCategories, createCategory, updateCategory, deleteCategory, type Category } from '@/integrations/supabase/categories';
import { getSystemSetting, updateSystemSetting } from '@/integrations/supabase/settings';

export const SystemConfig: React.FC = () => {
  const { toast } = useToast();
  const [minStatements, setMinStatements] = useState(6);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryError, setNewCategoryError] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [editCategoryError, setEditCategoryError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Loading system settings and categories...');
      
      // Load minimum statements setting
      const minStatementsValue = await getSystemSetting('min_statements_per_poll');
      if (minStatementsValue) {
        setMinStatements(parseInt(minStatementsValue, 10));
      }
      
      // Load categories separately
      await loadCategories();
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'שגיאה בטעינת הנתונים',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const validateCategoryName = (name: string): string => {
    if (!name.trim()) {
      return 'שם הקטגוריה הוא שדה חובה';
    }
    if (name.trim().length < 2) {
      return 'שם הקטגוריה חייב להכיל לפחות 2 תווים';
    }
    if (name.trim().length > 50) {
      return 'שם הקטגוריה לא יכול להכיל יותר מ-50 תווים';
    }
    if (categories.some(cat => cat.name.toLowerCase() === name.trim().toLowerCase())) {
      return 'קטגוריה עם השם הזה כבר קיימת';
    }
    return '';
  };

  const handleSaveMinStatements = async () => {
    try {
      setSaving(true);
      await updateSystemSetting('min_statements_per_poll', minStatements.toString());
      toast({
        title: 'הגדרות נשמרו',
        description: `מינימום הצהרות לסקר עודכן ל-${minStatements}`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'שגיאה בשמירת ההגדרות',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    const error = validateCategoryName(newCategoryName);
    if (error) {
      setNewCategoryError(error);
      return;
    }
    
    try {
      setOperationLoading('add');
      console.log('Creating new category:', newCategoryName.trim());
      const newCategory = await createCategory(newCategoryName.trim());
      console.log('Category created:', newCategory);
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setNewCategoryError('');
      setShowNewCategoryDialog(false);
      
      toast({
        title: 'קטגוריה נוספה',
        description: `הקטגוריה "${newCategoryName.trim()}" נוספה בהצלחה`,
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

  const handleEditCategory = async () => {
    if (!editingCategory) return;
    
    const error = validateCategoryName(editingCategory.name);
    if (error) {
      setEditCategoryError(error);
      return;
    }
    
    try {
      setOperationLoading('edit');
      console.log('Updating category:', editingCategory);
      await updateCategory(editingCategory.id, editingCategory.name.trim());
      setCategories(categories.map(cat => 
        cat.category_id === editingCategory.id 
          ? { ...cat, name: editingCategory.name.trim() }
          : cat
      ));
      setEditingCategory(null);
      setEditCategoryError('');
      
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
    if (category && category.polls_count && category.polls_count > 0) {
      toast({
        title: 'לא ניתן למחוק',
        description: 'לא ניתן למחוק קטגוריה שיש בה סקרים פעילים',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`האם אתה בטוח שברצונך למחוק את הקטגוריה "${category?.name}"?`)) {
      return;
    }
    
    try {
      setOperationLoading(categoryId);
      console.log('Deleting category:', categoryId);
      await deleteCategory(categoryId);
      setCategories(categories.filter(c => c.category_id !== categoryId));
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

  const handleNewCategoryDialogChange = (open: boolean) => {
    setShowNewCategoryDialog(open);
    if (!open) {
      setNewCategoryName('');
      setNewCategoryError('');
    }
  };

  const handleEditCategoryDialogChange = (open: boolean) => {
    if (!open) {
      setEditingCategory(null);
      setEditCategoryError('');
    }
  };

  const handleNewCategoryNameChange = (value: string) => {
    setNewCategoryName(value);
    if (newCategoryError) {
      setNewCategoryError('');
    }
  };

  const handleEditCategoryNameChange = (value: string) => {
    setEditingCategory(prev => prev ? { ...prev, name: value } : null);
    if (editCategoryError) {
      setEditCategoryError('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="general" className="hebrew-text">הגדרות כלליות</TabsTrigger>
        <TabsTrigger value="categories" className="hebrew-text">ניהול קטגוריות</TabsTrigger>
      </TabsList>

      {/* General Settings Tab */}
      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              הגדרות מערכת כלליות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-statements">מינימום הצהרות לסקר חדש</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="min-statements"
                  type="number"
                  value={minStatements}
                  onChange={(e) => setMinStatements(Number(e.target.value))}
                  min={1}
                  max={50}
                  className="w-32"
                />
                <Button 
                  onClick={handleSaveMinStatements} 
                  size="sm"
                  disabled={saving}
                >
                  <Save className="h-4 w-4 ml-1" />
                  {saving ? 'שומר...' : 'שמור'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                מספר ההצהרות המינימלי הנדרש ליצירת סקר חדש
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Categories Management Tab */}
      <TabsContent value="categories" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">ניהול קטגוריות</h3>
          <Dialog open={showNewCategoryDialog} onOpenChange={handleNewCategoryDialogChange}>
            <DialogTrigger asChild>
              <Button disabled={operationLoading !== null}>
                <Plus className="h-4 w-4 ml-1" />
                קטגוריה חדשה
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>הוספת קטגוריה חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">שם הקטגוריה</Label>
                  <Input
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => handleNewCategoryNameChange(e.target.value)}
                    placeholder="הכנס שם קטגוריה..."
                    maxLength={50}
                  />
                  {newCategoryError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {newCategoryError}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewCategoryDialog(false)}
                  disabled={operationLoading === 'add'}
                >
                  ביטול
                </Button>
                <Button 
                  onClick={handleAddCategory}
                  disabled={operationLoading === 'add' || !newCategoryName.trim()}
                >
                  {operationLoading === 'add' ? 'מוסיף...' : 'הוסף'}
                </Button>
              </DialogFooter>
            </DialogContent>
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

        {categoriesLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : categories.length === 0 && !categoriesError ? (
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
              <Card key={category.category_id}>
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
                        onClick={() => setEditingCategory({ id: category.category_id, name: category.name })}
                        disabled={operationLoading !== null}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category.category_id)}
                        disabled={
                          operationLoading !== null || 
                          (category.polls_count && category.polls_count > 0)
                        }
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
            ))}
          </div>
        )}

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={handleEditCategoryDialogChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>עריכת קטגוריה</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">שם הקטגוריה</Label>
                <Input
                  id="edit-category-name"
                  value={editingCategory?.name || ''}
                  onChange={(e) => handleEditCategoryNameChange(e.target.value)}
                  placeholder="הכנס שם קטגוריה..."
                  maxLength={50}
                />
                {editCategoryError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {editCategoryError}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditingCategory(null)}
                disabled={operationLoading === 'edit'}
              >
                ביטול
              </Button>
              <Button 
                onClick={handleEditCategory}
                disabled={operationLoading === 'edit' || !editingCategory?.name.trim()}
              >
                {operationLoading === 'edit' ? 'מעדכן...' : 'עדכן'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>
  );
};
