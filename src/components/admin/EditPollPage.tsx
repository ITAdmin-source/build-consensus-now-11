
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
import { ArrowRight, Save, Settings, FileText, RefreshCw, ExternalLink, RotateCcw } from 'lucide-react';
import { StatementsManagement } from './StatementsManagement';
import { ConfirmationDialog } from './ConfirmationDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPollById } from '@/integrations/supabase/polls';
import { resetPollVotes } from '@/integrations/supabase/polls/mutations';
import { fetchCategories } from '@/integrations/supabase/categories';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug, isSlugFormatValid } from '@/utils/slugUtils';
import type { Poll } from '@/types/poll';

const editPollSchema = z.object({
  title: z.string().min(1, 'כותרת נדרשת').max(100, 'כותרת ארוכה מדי'),
  topic: z.string().min(1, 'נושא נדרש').max(50, 'נושא ארוך מדי'),
  description: z.string().min(10, 'תיאור חייב להכיל לפחות 10 תווים').max(500, 'תיאור ארוך מדי'),
  category_id: z.string().min(1, 'קטגוריה נדרשת'),
  slug: z.string().min(1, 'כתובת URL נדרשת').max(100, 'כתובת URL ארוכה מדי'),
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

export const EditPollPage: React.FC = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<EditPollFormData>({
    resolver: zodResolver(editPollSchema),
    defaultValues: {
      title: '',
      topic: '',
      description: '',
      category_id: '',
      slug: '',
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

  // Fetch categories from database
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Fetch poll data
  const { data: poll, isLoading, error } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => fetchPollById(pollId!),
    enabled: !!pollId
  });

  const handleGenerateSlug = () => {
    const title = form.getValues('title');
    if (title) {
      const generatedSlug = generateSlug(title);
      form.setValue('slug', generatedSlug);
    }
  };

  // Add the missing handleResetVotes function
  const handleResetVotes = () => {
    resetVotesMutation.mutate();
  };

  // Reset votes mutation
  const resetVotesMutation = useMutation({
    mutationFn: () => resetPollVotes(pollId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast({
        title: 'הצבעות נמחקו בהצלחה',
        description: 'כל ההצבעות והקבוצות נמחקו. הסקר מוכן להתחלה חדשה.',
      });
      setShowResetDialog(false);
    },
    onError: (error) => {
      console.error('Reset votes error:', error);
      toast({
        title: 'שגיאה במחיקת הצבעות',
        description: error.message || 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  });

  // Update poll mutation
  const updatePollMutation = useMutation({
    mutationFn: async (data: EditPollFormData) => {
      console.log('Updating poll with data:', data);
      
      if (!pollId) {
        throw new Error('Poll ID is missing');
      }

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!data.title || !data.topic || !data.description || !data.category_id || !data.slug) {
        throw new Error('Missing required fields');
      }

      // Validate slug format
      const slugValidation = isSlugFormatValid(data.slug);
      if (!slugValidation.valid) {
        throw new Error(slugValidation.error);
      }

      // Convert datetime-local to ISO string if needed
      let endTime = data.end_time;
      if (endTime && !endTime.includes('T')) {
        endTime = data.end_time + ':00';
      }
      if (endTime && !endTime.includes('Z') && !endTime.includes('+')) {
        endTime = new Date(endTime).toISOString();
      }

      console.log('Processed end_time:', endTime);

      // Remove .single() to avoid the JSON object error
      const { data: updatedPoll, error } = await supabase
        .from('polis_polls')
        .update({
          title: data.title.trim(),
          topic: data.topic.trim(),
          description: data.description.trim(),
          category_id: data.category_id,
          slug: data.slug.trim(),
          end_time: endTime,
          min_consensus_points_to_win: data.min_consensus_points_to_win,
          allow_user_statements: data.allow_user_statements,
          auto_approve_statements: data.auto_approve_statements,
          status: data.status,
          min_support_pct: data.min_support_pct,
          max_opposition_pct: data.max_opposition_pct,
          min_votes_per_group: data.min_votes_per_group
        })
        .eq('poll_id', pollId)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!updatedPoll || updatedPoll.length === 0) {
        throw new Error('No poll was updated. Check if the poll exists and you have permission to update it.');
      }
      
      console.log('Poll updated successfully:', updatedPoll);
      return updatedPoll[0];
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
      console.error('Update poll error:', error);
      toast({
        title: 'שגיאה בעדכון הסקר',
        description: error.message || 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  });

  // Update form values when poll data is loaded
  useEffect(() => {
    if (poll && categories) {
      console.log('Setting form values from poll:', poll);
      
      // Find category_id by name
      const category = categories.find(cat => cat.name === poll.category);
      const categoryId = category?.category_id || '';
      
      console.log('Found category:', category, 'ID:', categoryId);

      // Format datetime for datetime-local input
      let formattedEndTime = '';
      if (poll.end_time) {
        const date = new Date(poll.end_time);
        if (!isNaN(date.getTime())) {
          formattedEndTime = date.toISOString().slice(0, 16);
        }
      }

      form.reset({
        title: poll.title || '',
        topic: poll.topic || '',
        description: poll.description || '',
        category_id: categoryId,
        slug: poll.slug || '',
        end_time: formattedEndTime,
        min_consensus_points_to_win: poll.min_consensus_points_to_win || 5,
        allow_user_statements: poll.allow_user_statements ?? true,
        auto_approve_statements: poll.auto_approve_statements ?? false,
        min_support_pct: poll.min_support_pct || 60,
        max_opposition_pct: poll.max_opposition_pct || 30,
        min_votes_per_group: poll.min_votes_per_group || 3,
        status: poll.status || 'draft'
      });
    }
  }, [poll, categories, form]);

  const onSubmit = async (data: EditPollFormData) => {
    console.log('Form submitted with data:', data);
    updatePollMutation.mutate(data);
  };

  if (isLoading || categoriesLoading) {
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

  const pollUrl = poll.slug ? `/poll/${poll.slug}` : `/poll/${poll.poll_id}`;
  const hasVotes = poll.total_votes > 0;

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                {poll.status === 'active' ? 'פעיל' : poll.status === 'draft' ? 'טיוטה' : 'סגור'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {poll.total_votes} הצבעות | {poll.current_consensus_points}/{poll.min_consensus_points_to_win} נק' חיבור
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasVotes && poll.status !== 'active' && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowResetDialog(true)}
                  disabled={resetVotesMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 ml-1" />
                  איפוס הצבעות
                </Button>
              )}
              {poll.slug && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(pollUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 ml-1" />
                  צפה בסקר
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 hebrew-text">
              <TabsTrigger value="basic" className="hebrew-text">
                <Settings className="h-4 w-4 ml-1" />
                הגדרות בסיסיות
              </TabsTrigger>
              <TabsTrigger value="statements" className="hebrew-text">
                <FileText className="h-4 w-4 ml-1" />
                ניהול הצהרות
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
                              הסקר זמין בכתובת: {pollUrl}
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
                              <Input className="hebrew-text text-right" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="hebrew-text">קטגוריה</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="hebrew-text">
                                  <SelectValue placeholder="בחר קטגוריה" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map((category) => (
                                  <SelectItem key={category.category_id} value={category.category_id} className="hebrew-text">
                                    {category.name}
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
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
          </Tabs>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="איפוס הצבעות בסקר"
        description={`פעולה זו תמחק את כל ההצבעות (${poll.total_votes} הצבעות), הקבוצות, ונתוני הקבצה בסקר. ההצהרות יישארו ללא שינוי. פעולה זו בלתי הפיכה.`}
        confirmText="מחק הצבעות"
        cancelText="ביטול"
        variant="destructive"
        onConfirm={handleResetVotes}
        isLoading={resetVotesMutation.isPending}
      />
    </div>
  );
};
