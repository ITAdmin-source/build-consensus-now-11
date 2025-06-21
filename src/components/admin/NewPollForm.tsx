import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save } from 'lucide-react';

const pollSchema = z.object({
  title: z.string().min(1, 'כותרת נדרשת').max(100, 'כותרת ארוכה מדי'),
  topic: z.string().min(1, 'נושא נדרש').max(50, 'נושא ארוך מדי'),
  description: z.string().min(10, 'תיאור חייב להכיל לפחות 10 תווים').max(500, 'תיאור ארוך מדי'),
  category: z.string().min(1, 'קטגוריה נדרשת'),
  end_time: z.string().min(1, 'זמן סיום נדרש'),
  min_consensus_points_to_win: z.number().min(1, 'מינימום נקודת חיבור אחת').max(20, 'מקסימום 20 נקודות חיבור'),
  allow_user_statements: z.boolean(),
  auto_approve_statements: z.boolean(),
  min_support_pct: z.number().min(0, 'מינימום 0%').max(100, 'מקסימום 100%'),
  max_opposition_pct: z.number().min(0, 'מינימום 0%').max(100, 'מקסימום 100%'),
  min_votes_per_group: z.number().min(1, 'מינימום הצבעה אחת לקבוצה')
});

type PollFormData = z.infer<typeof pollSchema>;

const categories = [
  { value: 'politics', label: 'פוליטיקה' },
  { value: 'education', label: 'חינוך' },
  { value: 'environment', label: 'איכות סביבה' },
  { value: 'economy', label: 'כלכלה' },
  { value: 'society', label: 'חברה' },
  { value: 'technology', label: 'טכנולוגיה' },
  { value: 'health', label: 'בריאות' },
  { value: 'transport', label: 'תחבורה' }
];

interface NewPollFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const NewPollForm: React.FC<NewPollFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  
  const form = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: '',
      topic: '',
      description: '',
      category: '',
      end_time: '',
      min_consensus_points_to_win: 5,
      allow_user_statements: true,
      auto_approve_statements: false,
      min_support_pct: 60,
      max_opposition_pct: 30,
      min_votes_per_group: 3
    }
  });

  const onSubmit = async (data: PollFormData) => {
    try {
      // Mock API call - in real app would call backend
      console.log('Creating new poll:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'סקר נוצר בהצלחה',
        description: `הסקר "${data.title}" נוצר ומוכן לשימוש`,
      });
      
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'שגיאה ביצירת הסקר',
        description: 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="hebrew-text text-2xl">יצירת סקר חדש</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold hebrew-text">מידע בסיסי</h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hebrew-text">כותרת הסקר</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="לדוגמה: עתיד החינוך בישראל" 
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
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hebrew-text">נושא</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="לדוגמה: חינוך" 
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hebrew-text">קטגוריה</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="hebrew-text">
                            <SelectValue placeholder="בחר קטגוריה" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value} className="hebrew-text">
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hebrew-text">תיאור הסקר</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="תאר את מטרת הסקר ומה השאלות שתרצה לחקור..."
                          className="hebrew-text text-right min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold hebrew-text">הגדרות סקר</h3>
                
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

                <FormField
                  control={form.control}
                  name="min_consensus_points_to_win"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hebrew-text">נקודות חיבור לניצחון</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="allow_user_statements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="hebrew-text text-base">
                            אפשר למשתמשים להציע הצהרות
                          </FormLabel>
                          <div className="text-sm text-muted-foreground hebrew-text">
                            משתמשים יוכלו להוסיף הצהרות חדשות לסקר
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="auto_approve_statements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="hebrew-text text-base">
                            אישור אוטומטי להצהרות משתמשים
                          </FormLabel>
                          <div className="text-sm text-muted-foreground hebrew-text">
                            הצהרות חדשות יאושרו אוטומטית ללא בדיקה ידנית
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!form.watch("allow_user_statements")}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="min_support_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="hebrew-text">אחוז תמיכה מינימלי (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_opposition_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="hebrew-text">אחוז התנגדות מקסימלי (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_votes_per_group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="hebrew-text">מינימום הצבעות לקבוצה</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <div className="flex gap-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  <Save className="h-4 w-4 ml-1" />
                  {form.formState.isSubmitting ? 'יוצר...' : 'צור סקר'}
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
      </CardContent>
    </Card>
  );
};
