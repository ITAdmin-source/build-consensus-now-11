
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { Round, CreateRoundData, UpdateRoundData } from '@/types/round';
import { createRound, updateRound } from '@/integrations/supabase/rounds';

const roundSchema = z.object({
  title: z.string().min(1, 'כותרת נדרשת').max(100, 'כותרת ארוכה מדי'),
  description: z.string().optional(),
  start_time: z.string().min(1, 'זמן התחלה נדרש'),
  end_time: z.string().min(1, 'זמן סיום נדרש'),
  publish_status: z.enum(['draft', 'published']),
}).refine((data) => {
  return new Date(data.start_time) < new Date(data.end_time);
}, {
  message: 'זמן התחלה חייב להיות לפני זמן הסיום',
  path: ['end_time'],
});

type RoundFormData = z.infer<typeof roundSchema>;

interface RoundFormProps {
  round?: Round;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RoundForm: React.FC<RoundFormProps> = ({ round, onSuccess, onCancel }) => {
  const { toast } = useToast();
  
  const form = useForm<RoundFormData>({
    resolver: zodResolver(roundSchema),
    defaultValues: {
      title: round?.title || '',
      description: round?.description || '',
      start_time: round?.start_time ? new Date(round.start_time).toISOString().slice(0, 16) : '',
      end_time: round?.end_time ? new Date(round.end_time).toISOString().slice(0, 16) : '',
      publish_status: round?.publish_status || 'draft',
    }
  });

  const onSubmit = async (data: RoundFormData) => {
    try {
      const roundData = {
        title: data.title,
        description: data.description,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        publish_status: data.publish_status,
      };

      if (round) {
        // Update existing round
        await updateRound({
          round_id: round.round_id,
          ...roundData,
        } as UpdateRoundData);
        toast({
          title: 'הסיבוב עודכן בהצלחה',
          description: 'השינויים נשמרו במערכת',
        });
      } else {
        // Create new round
        await createRound(roundData as CreateRoundData);
        toast({
          title: 'הסיבוב נוצר בהצלחה',
          description: 'הסיבוב החדש זמין עכשיו',
        });
      }
      
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving round:', error);
      toast({
        title: 'שגיאה בשמירת הסיבוב',
        description: 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="hebrew-text">כותרת הסיבוב</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="לדוגמה: סיבוב בחירות 2024" 
                    className="hebrew-text text-right"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="hebrew-text">תיאור הסיבוב</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="תאר את מטרת הסיבוב ומה השאלות שתרצה לחקור..."
                    className="hebrew-text text-right min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="hebrew-text">זמן התחלה</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="hebrew-text">זמן סיום</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="publish_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="hebrew-text">סטטוס פרסום</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="hebrew-text">
                      <SelectValue placeholder="בחר סטטוס פרסום" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft" className="hebrew-text">טיוטה</SelectItem>
                    <SelectItem value="published" className="hebrew-text">פורסם</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-6 border-t">
          <div className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Save className="h-4 w-4 ml-1" />
              {form.formState.isSubmitting ? 'שומר...' : round ? 'עדכן סיבוב' : 'צור סיבוב'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                ביטול
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};
