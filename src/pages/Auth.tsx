
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Home, LogIn, UserPlus } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
});

const signupSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  // Redirect authenticated users to home
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const onLoginSubmit = async (data: LoginFormData) => {
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      toast({
        title: 'שגיאת התחברות',
        description: error.message === 'Invalid login credentials' 
          ? 'כתובת אימייל או סיסמה שגויים'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'התחברות הצליחה',
        description: 'ברוך הבא לנקודות חיבור',
      });
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    const { error } = await signUp(data.email, data.password, data.fullName);
    
    if (error) {
      toast({
        title: 'שגיאת הרשמה',
        description: error.message === 'User already registered'
          ? 'משתמש כבר רשום במערכת'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'הרשמה הצליחה',
        description: 'נשלח אימייל לאימות החשבון',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center hebrew-text">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 hebrew-text">
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

        {/* Auth Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {isLogin ? (
                <LogIn className="h-6 w-6 text-primary" />
              ) : (
                <UserPlus className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl hebrew-text">
              {isLogin ? 'התחברות' : 'הרשמה'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full hebrew-text">
                    התחבר
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="hebrew-text">שם מלא</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="הזן שם מלא"
                            className="text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="hebrew-text">סיסמה</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="הזן סיסמה (לפחות 6 תווים)"
                            className="text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full hebrew-text">
                    הירשם
                  </Button>
                </form>
              </Form>
            )}

            {/* Toggle between login and signup */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground hebrew-text">
                {isLogin ? 'אין לך חשבון?' : 'יש לך כבר חשבון?'}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="hebrew-text p-0 h-auto font-normal"
              >
                {isLogin ? 'הירשם כאן' : 'התחבר כאן'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
