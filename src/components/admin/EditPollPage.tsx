
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save, Clock, RotateCcw, Trash2 } from 'lucide-react';
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

// Mock poll data
const mockPoll: Poll = {
  poll_id: '1',
  title: 'עתיד החינוך בישראל',
  topic: 'חינוך',
  description: 'סקר לבדיקת דעות הציבור על כיווני החינוך בישראל בעשור הבא',
  category: 'education',
  end_time: '2024-12-31T23:59:59',
  min_consensus_points_to_win: 5,
  allow_user_statements: true,
  auto_approve_statements: false,
  status: 'active',
  min_support_pct: 60,
  max_opposition_pct: 30,
  min_votes_per_group: 3,
  current_consensus_points: 3,
  total_statements: 12,
  total_votes: 1247
};

export const EditPollPage: React.FC = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    // Mock API call to fetch poll data
    const fetchPoll = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In real app, would fetch from API using pollId
        const pollData = mockPoll;
        setPoll(pollData);
        
        // Set form values
        form.reset({
          title: pollData.title,
          topic: pollData.topic,
          description: pollData.description,
          category: pollData.category,
          end_time: pollData.end_time.slice(0, 16), // Format for datetime-local input
          min_consensus_points_to_win: pollData.min_consensus_points_to_win,
          allow_user_statements: pollData.allow_user_statements,
          auto_approve_statements: pollData.auto_approve_statements,
          min_support_pct: pollData.min_support_pct,
          max_opposition_pct: pollData.max_opposition_pct,
          min_votes_per_group: pollData.min_votes_per_group,
          status: pollData.status
        });
      } catch (error) {
        toast({
          title: 'שגיאה בטעינת הסקר',
          description: 'לא ניתן לטעון את פרטי הסקר',
          variant: 'destructive'
        });
        navigate('/admin/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoll();
  }, [pollId, form, navigate, toast]);

  const onSubmit = async (data: EditPollFormData) => {
    try {
      console.log('Updating poll:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'סקר עודכן בהצלחה',
        description: 'השינויים נשמרו במערכת',
      });
    } catch (error) {
      toast({
        title: 'שגיאה בעדכון הסקר',
        description: 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  };

  const handleExtendTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const newEndTime = tomorrow.toISOString().slice(0, 16);
    
    form.setValue('end_time', newEndTime);
    toast({
      title: 'זמן הסקר הוארך',
      description: 'הסקר יסתיים בעוד שבוע מהיום',
    });
  };

  const handleResetPoll = () => {
    if (confirm('האם אתה בטוח שברצונך לאפס את הסקר? פעולה זו תמחק את כל ההצבעות!')) {
      toast({
        title: 'הסקר אופס',
        description: 'כל ההצבעות נמחקו והסקר חוזר למצב התחלתי',
      });
    }
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

  if (!poll) {
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
            <p className="text-muted-foreground hebrew-text">עריכה ועדכון הגדרות הסקר</p>
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

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="hebrew-text">פרטי הסקר</CardTitle>
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
                          <Textarea 
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
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field} 
                            />
                          </FormControl>
                          <Button type="button" size="sm" variant="outline" onClick={handleExtendTime}>
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
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
                    {form.formState.isSubmitting ? 'שומר...' : 'שמור שינויים'}
                  </Button>
                  
                  <Button type="button" variant="outline" onClick={handleExtendTime}>
                    <Clock className="h-4 w-4 ml-1" />
                    הארך זמן
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleResetPoll}>
                    <RotateCcw className="h-4 w-4 ml-1" />
                    אפס סקר
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => {
                      if (confirm('האם אתה בטוח שברצונך למחוק את הסקר?')) {
                        toast({
                          title: 'הסקר נמחק',
                          description: 'הסקר הוסר מהמערכת',
                        });
                        navigate('/admin/dashboard');
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    מחק סקר
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
