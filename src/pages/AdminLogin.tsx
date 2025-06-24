
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Home, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(1, 'נדרשת סיסמה'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, loading, isAdmin, isAuthenticated, refreshUserRole } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin && !loading) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      toast({
        title: 'שגיאת התחברות',
        description: 'כתובת אימייל או סיסמה שגויים',
        variant: 'destructive',
      });
      return;
    }

    // Wait for role to be fetched and check admin status
    setTimeout(async () => {
      await refreshUserRole();
      // Check if user has admin role after login
      if (isAdmin) {
        toast({
          title: 'התחברות הצליחה',
          description: 'ברוך הבא למערכת הניהול',
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: 'אין הרשאות ניהול',
          description: 'המשתמש אינו מורשה לגשת למערכת הניהול',
          variant: 'destructive',
        });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 hebrew-text">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Home Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hebrew-text text-muted-foreground hover:text-primary"
          >
            <Home className="h-4 w-4 ml-1" />
            חזרה לדף הבית
          </Button>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl hebrew-text">כניסת מנהלים</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hebrew-text">כתובת אימייל</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="הזן כתובת אימייל"
                          className="text-right"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hebrew-text">סיסמה</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="הזן סיסמה"
                          className="text-right"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full hebrew-text" 
                  disabled={loading}
                >
                  {loading ? 'מתחבר...' : 'התחבר'}
                </Button>
              </form>
            </Form>

            {/* Instructions for Admin Access */}
            <div className="mt-6 p-3 bg-muted rounded-lg text-sm text-muted-foreground text-center hebrew-text">
              <p className="font-medium mb-1">גישה למנהלים בלבד</p>
              <p>השתמש בכתובת האימייל והסיסמה שלך</p>
              <p>רק משתמשים עם הרשאות ניהול יוכלו להיכנס</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
