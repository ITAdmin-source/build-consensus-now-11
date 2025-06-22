
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginSchema, LoginFormData } from './schemas';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
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
                  dir="rtl"
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
                  dir="rtl"
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
  );
};

export default LoginForm;
