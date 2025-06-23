import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save, Settings, FileText, BarChart3, Download } from 'lucide-react';
import { StatementsManagement } from './StatementsManagement';
import { AdvancedSettings } from './AdvancedSettings';
import { PollAnalytics } from './PollAnalytics';
import { ExportImport } from './ExportImport';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPollById } from '@/integrations/supabase/polls';
import { supabase } from '@/integrations/supabase/client';
import type { Poll } from '@/types/poll';

const editPollSchema = z.object({
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
  min_votes_per_group: z.number().min(1, 'מינימום הצבעה אחת לקבוצה'),
  status: z.enum(['draft', 'active', 'closed'])
});

type EditPollFormData = z.infer<typeof editPollSchema>;

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

export const EditPollPage: React.FC = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const queryClient = useQueryClient();

  const form = useForm<EditPollFormData>({
    resolver: zodResolver(editPollSchema),
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
      min_votes_per_group: 3,
      status: 'draft'
    }
  });

  // Fetch poll data
  const { data: poll, isLoading, error } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => fetchPollById(pollId!),
    enabled: !!pollId
  });

  // Update poll mutation
  const updatePollMutation = useMutation({
    mutationFn: async (data: EditPollFormData) => {
      // First, get or create the category
      let categoryId: string;
      const { data: existingCategory } = await supabase
        .from('polis_poll_categories')
        .select('category_id')
        .eq('name', data.category)
        .single();

      if (existingCategory) {
        categoryId = existingCategory.category_id;
      } else {
        const { data: newCategory, error: categoryError } = await supabase
          .from('polis_poll_categories')
          .insert({ name: data.category })
          .select('category_id')
          .single();
        
        if (categoryError) throw categoryError;
        categoryId = newCategory.category_id;
      }

      const { data: updatedPoll, error } = await supabase
        .from('polis_polls')
        .update({
          title: data.title,
          topic: data.topic,
          description: data.description,
          category_id: categoryId,
          end_time: data.end_time,
          min_consensus_points_to_win: data.min_consensus_points_to_win,
          allow_user_statements: data.allow_user_statements,
          auto_approve_statements: data.auto_approve_statements,
          status: data.status,
          min_support_pct: data.min_support_pct,
          max_opposition_pct: data.max_opposition_pct,
          min_votes_per_group: data.min_votes_per_group
        })
        .eq('poll_id', pollId)
        .select()
        .single();

      if (error) throw error;
      return updatedPoll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast({
        title: 'סקר עודכן בהצלחה',
        description: 'השינויים נשמרו במערכת',
      });
    },
    onError: (error) => {
      toast({
        title: 'שגיאה בעדכון הסקר',
        description: 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  });

  // Update form values when poll data is loaded
  useEffect(() => {
    if (poll) {
      form.reset({
        title: poll.title,
        topic: poll.topic,
        description: poll.description,
        category: poll.category,
        end_time: poll.end_time ? poll.end_time.slice(0, 16) : '',
        min_consensus_points_to_win: poll.min_consensus_points_to_win,
        allow_user_statements: poll.allow_user_statements,
        auto_approve_statements: poll.auto_approve_statements,
        min_support_pct: poll.min_support_pct,
        max_opposition_pct: poll.max_opposition_pct,
        min_votes_per_group: poll.min_votes_per_group,
        status: poll.status
      });
    }
  }, [poll, form]);

  const onSubmit = async (data: EditPollFormData) => {
    updatePollMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground hebrew-text">טוען...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground hebrew-text">סקר לא נמצא</p>
          <Button onClick={() => navigate('/admin/dashboard')}>
            חזור למערכת הניהול
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/dashboard')}
          className="mb-4 hebrew-text"
        >
          <ArrowRight className="h-4 w-4 ml-1" />
          חזור למערכת הניהול
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold hebrew-text">עריכת סקר</h1>
            <p className="text-muted-foreground hebrew-text">ניהול ועריכה מתקדמת של הסקר</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
              {poll.status === 'active' ? 'פעיל' : poll.status === 'draft' ? 'טיוטה' : 'סגור'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {poll.total_votes} הצבעות | {poll.current_consensus_points}/{poll.min_consensus_points_to_win} נק' חיבור
            </span>
          </div>
        </div>
      </div>

      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 hebrew-text">
              <TabsTrigger value="basic" className="hebrew-text">
                <Settings className="h-4 w-4 ml-1" />
                הגדרות בסיסיות
              </TabsTrigger>
              <TabsTrigger value="statements" className="hebrew-text">
                <FileText className="h-4 w-4 ml-1" />
                ניהול הצהרות
              </TabsTrigger>
              <TabsTrigger value="advanced" className="hebrew-text">
                <Settings className="h-4 w-4 ml-1" />
                הגדרות מתקדמות
              </TabsTrigger>
              <TabsTrigger value="analytics" className="hebrew-text">
                <BarChart3 className="h-4 w-4 ml-1" />
                אנליטיקה
              </TabsTrigger>
              <TabsTrigger value="export" className="hebrew-text">
                <Download className="h-4 w-4 ml-1" />
                ייצוא/ייבוא
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold hebrew-text">מידע בסיסי</h3>
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="hebrew-text">כותרת הסקר</FormLabel>
                            <FormControl>
                              <Input className="hebrew-text text-right" {...field} />
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
                              <Input className="hebrew-text text-right" {...field} />
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="hebrew-text">
                                  <SelectValue />
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
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="hebrew-text">סטטוס</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="hebrew-text">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft" className="hebrew-text">טיוטה</SelectItem>
                                <SelectItem value="active" className="hebrew-text">פעיל</SelectItem>
                                <SelectItem value="closed" className="hebrew-text">סגור</SelectItem>
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
                              <Textarea className="hebrew-text text-right min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold hebrew-text">הגדרות סקר</h3>
                      
                      <FormField
                        control={form.control}
                        name="end_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="hebrew-text">זמן סיום</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
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
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <Button 
                      type="submit" 
                      disabled={updatePollMutation.isPending}
                    >
                      <Save className="h-4 w-4 ml-1" />
                      {updatePollMutation.isPending ? 'שומר...' : 'שמור שינויים'}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="statements" className="mt-6">
              <StatementsManagement pollId={pollId || ''} />
            </TabsContent>

            <TabsContent value="advanced" className="mt-6">
              <AdvancedSettings pollId={pollId || ''} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <PollAnalytics pollId={pollId || ''} />
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <ExportImport pollId={pollId || ''} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
