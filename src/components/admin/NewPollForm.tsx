
import React, { useState, useEffect } from 'react';
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
import { ArrowRight, Save, RefreshCw } from 'lucide-react';
import { createPoll } from '@/integrations/supabase/admin';
import { fetchAllRounds } from '@/integrations/supabase/rounds';
import { generateSlug, isSlugFormatValid } from '@/utils/slugUtils';
import { Round } from '@/types/round';

const pollSchema = z.object({
  title: z.string().min(1, 'כותרת נדרשת').max(100, 'כותרת ארוכה מדי'),
  topic: z.string().min(1, 'נושא נדרש').max(50, 'נושא ארוך מदי'),
  description: z.string().min(10, 'תיאור חייב להכיל לפחות 10 תווים').max(500, 'תיאור ארוך מדי'),
  category: z.string().min(1, 'קטגוריה נדרשת'),
  slug: z.string().min(1, 'כתובת URL נדרשת').max(100, 'כתובת URL ארוכה מדי'),
  round_id: z.string().min(1, 'יש לבחור סיבוב'),
  min_consensus_points_to_win: z.number().min(1, 'מינימום נקודת חיבור אחת').max(20, 'מקסימום 20 נקודות חיבור'),
  allow_user_statements: z.boolean(),
  auto_approve_statements: z.boolean(),
  min_support_pct: z.number().min(0, 'מינימום 0%').max(100, 'מקסימום 100%'),
  max_opposition_pct: z.number().min(0, 'מינימום 0%').max(100, 'מקסימום 100%'),
  min_votes_per_group: z.number().min(1, 'מינימום הצבעה אחת לקבוצה')
});

type PollFormData = z.infer<typeof pollSchema>;

const categories = [
  { value: 'פוליטיקה', label: 'פוליטיקה' },
  { value: 'חינוך', label: 'חינוך' },
  { value: 'איכות סביבה', label: 'איכות סביבה' },
  { value: 'כלכלה', label: 'כלכלה' },
  { value: 'חברה', label: 'חברה' },
  { value: 'טכנולוגיה', label: 'טכנולוגיה' },
  { value: 'בריאות', label: 'בריאות' },
  { value: 'תחבורה', label: 'תחבורה' }
];

interface NewPollFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const NewPollForm: React.FC<NewPollFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [slugGenerated, setSlugGenerated] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundsLoading, setRoundsLoading] = useState(true);
  
  const form = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: '',
      topic: '',
      description: '',
      category: '',
      slug: '',
      round_id: '',
      min_consensus_points_to_win: 5,
      allow_user_statements: true,
      auto_approve_statements: false,
      min_support_pct: 60,
      max_opposition_pct: 30,
      min_votes_per_group: 3
    }
  });

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    try {
      setRoundsLoading(true);
      const roundsData = await fetchAllRounds();
      setRounds(roundsData);
    } catch (error) {
      console.error('Error loading rounds:', error);
      toast({
        title: 'שגיאה בטעינת הסיבובים',
        description: 'לא ניתן לטעון את רשימת הסיבובים',
        variant: 'destructive'
      });
    } finally {
      setRoundsLoading(false);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    if (!slugGenerated && title) {
      const generatedSlug = generateSlug(title);
      form.setValue('slug', generatedSlug);
    }
  };

  const handleGenerateSlug = () => {
    const title = form.getValues('title');
    if (title) {
      const generatedSlug = generateSlug(title);
      form.setValue('slug', generatedSlug);
      setSlugGenerated(true);
    }
  };

  const onSubmit = async (data: PollFormData) => {
    try {
      // Validate slug format
      const slugValidation = isSlugFormatValid(data.slug);
      if (!slugValidation.valid) {
        form.setError('slug', { message: slugValidation.error });
        return;
      }

      await createPoll({
        title: data.title,
        topic: data.topic,
        description: data.description,
        category: data.category,
        slug: data.slug,
        round_id: data.round_id,
        min_consensus_points_to_win: data.min_consensus_points_to_win,
        allow_user_statements: data.allow_user_statements,
        auto_approve_statements: data.auto_approve_statements,
        min_support_pct: data.min_support_pct,
        max_opposition_pct: data.max_opposition_pct,
        min_votes_per_group: data.min_votes_per_group
      });
      
      toast({
        title: 'סקר נוצר בהצלחה',
        description: `הסקר "${data.title}" נוצר ומוכן לשימוש`,
      });
      
      form.reset();
      setSlugGenerated(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating poll:', error);
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
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hebrew-text">כתובת URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="education-future" 
                            className="text-left"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setSlugGenerated(true);
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={handleGenerateSlug}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <div className="text-xs text-muted-foreground hebrew-text">
                        הסקר יהיה זמין בכתובת: /poll/{form.watch('slug')}
                      </div>
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
                  name="round_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hebrew-text">סיבוב הצבעה</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={roundsLoading}>
                        <FormControl>
                          <SelectTrigger className="hebrew-text">
                            <SelectValue placeholder={roundsLoading ? "טוען סיבובים..." : "בחר סיבוב"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rounds.map((round) => (
                            <SelectItem key={round.round_id} value={round.round_id} className="hebrew-text">
                              {round.title} ({round.publish_status === 'published' ? 'פורסם' : 'טיוטה'})
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
