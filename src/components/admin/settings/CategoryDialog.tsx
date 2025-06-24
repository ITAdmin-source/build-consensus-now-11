
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Category } from '@/integrations/supabase/categories';
import { validateCategoryName } from './categoryValidation';

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => Promise<void>;
  existingCategories: Category[];
  editingCategory?: { id: string; name: string } | null;
  operationLoading: boolean;
  title: string;
  saveButtonText: string;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  existingCategories,
  editingCategory,
  operationLoading,
  title,
  saveButtonText
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.name);
    } else {
      setCategoryName('');
    }
    setError('');
  }, [editingCategory, isOpen]);

  const handleSave = async () => {
    const validationError = validateCategoryName(categoryName, existingCategories, editingCategory?.id);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    await onSave(categoryName.trim());
  };

  const handleNameChange = (value: string) => {
    setCategoryName(value);
    if (error) {
      setError('');
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setCategoryName('');
      setError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">שם הקטגוריה</Label>
            <Input
              id="category-name"
              value={categoryName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="הכנס שם קטגוריה..."
              maxLength={50}
            />
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={operationLoading}
          >
            ביטול
          </Button>
          <Button 
            onClick={handleSave}
            disabled={operationLoading || !categoryName.trim()}
          >
            {operationLoading ? `${saveButtonText}...` : saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
