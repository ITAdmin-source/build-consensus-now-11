
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signupSchema, SignupFormData } from './schemas';

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit }) => {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="hebrew-text">שם מלא</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="הזן שם מלא"
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
                  placeholder="הזן סיסמה (לפחות 6 תווים)"
                  className="text-right"
                  dir="rtl"
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
  );
};

export default SignupForm;
