
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
  Save
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
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      
      // Load minimum statements setting
      const minStatementsValue = await getSystemSetting('min_statements_per_poll');
      if (minStatementsValue) {
        setMinStatements(parseInt(minStatementsValue, 10));
      }
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

  const handleSaveMinStatements = async () => {
    try {
      setSaving(true);
      await updateSystemSetting('min_statements_per_poll', minStatements.toString());
      toast({
        title: 'הגדרות נשמרו',
        description: `מינימום הצהרות לסקר עודכן ל-${minStatements}`,
      });
    } catch (error) {
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
    if (!newCategoryName.trim()) return;
    
    try {
      const newCategory = await createCategory(newCategoryName);
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setShowNewCategoryDialog(false);
      
      toast({
        title: 'קטגוריה נוספה',
        description: `הקטגוריה "${newCategoryName}" נוספה בהצלחה`,
      });
    } catch (error) {
      toast({
        title: 'שגיאה בהוספת קטגוריה',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    try {
      await updateCategory(editingCategory.id, editingCategory.name);
      setCategories(categories.map(cat => 
        cat.category_id === editingCategory.id 
          ? { ...cat, name: editingCategory.name }
          : cat
      ));
      setEditingCategory(null);
      
      toast({
        title: 'קטגוריה עודכנה',
        description: 'הקטגוריה עודכנה בהצלחה',
      });
    } catch (error) {
      toast({
        title: 'שגיאה בעדכון קטגוריה',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
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
    
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(c => c.category_id !== categoryId));
      toast({
        title: 'קטגוריה נמחקה',
        description: 'הקטגוריה נמחקה בהצלחה',
      });
    } catch (error) {
      toast({
        title: 'שגיאה במחיקת קטגוריה',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
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
          <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
            <DialogTrigger asChild>
              <Button>
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
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="הכנס שם קטגוריה..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
                  ביטול
                </Button>
                <Button onClick={handleAddCategory}>הוסף</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category.category_id)}
                      disabled={category.polls_count && category.polls_count > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
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
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="הכנס שם קטגוריה..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>
                ביטול
              </Button>
              <Button onClick={handleEditCategory}>עדכן</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>
  );
};
