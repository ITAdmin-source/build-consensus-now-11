
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Poll } from '@/types/poll';
import { Plus, Send, X, LogIn, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RegistrationCTA } from './RegistrationCTA';

interface UserStatementFormProps {
  poll: Poll;
  onSubmitStatement?: (content: string, contentType: string) => void;
  onClose?: () => void;
}

export const UserStatementForm: React.FC<UserStatementFormProps> = ({
  poll,
  onSubmitStatement,
  onClose
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !onSubmitStatement || !user) return;

    setIsSubmitting(true);
    try {
      await onSubmitStatement(content.trim(), contentType);
      setContent('');
      if (onClose) onClose();
      // Show success message or feedback
    } catch (error) {
      console.error('Error submitting statement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!poll.allow_user_statements) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Plus className="h-5 w-5" />
            הוסף הצהרה משלך
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hebrew-text"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground hebrew-text">
          {poll.auto_approve_statements 
            ? 'ההצהרה שלך תתווסף מיד לסקר'
            : 'ההצהרה שלך תיבדק ותאושר על ידי המנהלים'
          }
        </p>
      </CardHeader>
      
      <CardContent>
        {!user ? (
          <div className="space-y-4">
            <div className="text-center p-6 rounded-lg border-2 border-dashed border-muted-foreground/30">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold hebrew-text mb-2">
                רק משתמשים רשומים יכולים להוסיף הצהרות
              </h3>
              <p className="text-sm text-muted-foreground hebrew-text mb-4">
                הוספת הצהרות היא דרך נהדרת להשפיע על הדיון ולהביא נקודות מבט חדשות. 
                הרשם עכשיו כדי להיות חלק פעיל מהקהילה.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground hebrew-text">
                💡 למה כדאי להירשם? תוכל להוסיף הצהרות, לעקוב אחר ההתקדמות שלך ולקבל תובנות מעמיקות
              </div>
            </div>
            <RegistrationCTA context="social" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-type" className="hebrew-text">סוג התוכן</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text" className="hebrew-text">טקסט</SelectItem>
                  <SelectItem value="image" className="hebrew-text">תמונה</SelectItem>
                  <SelectItem value="audio" className="hebrew-text">אודיו</SelectItem>
                  <SelectItem value="video" className="hebrew-text">וידאו</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statement-content" className="hebrew-text">תוכן ההצהרה</Label>
              <Textarea
                id="statement-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={contentType === 'text' 
                  ? 'כתוב את ההצהרה שלך כאן...'
                  : `הוסף קישור ל${contentType === 'image' ? 'תמונה' : contentType === 'audio' ? 'אודיו' : 'וידאו'}`
                }
                className="min-h-[100px] text-right hebrew-text"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!content.trim() || isSubmitting}
                className="hebrew-text"
              >
                <Send className="h-4 w-4 ml-2" />
                {isSubmitting ? 'שולח...' : 'שלח הצהרה'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
