
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { LoginFormData, SignupFormData } from '@/components/auth/schemas';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const { getReturnUrl } = useReturnUrl();

  // Redirect authenticated users to their return URL or home
  useEffect(() => {
    if (user && !loading) {
      const returnUrl = getReturnUrl();
      navigate(returnUrl);
    }
  }, [user, loading, navigate, getReturnUrl]);

  const onLoginSubmit = async (data: LoginFormData) => {
    console.log('Login form submitted:', data.email);
    
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      console.error('Login error:', error);
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
    console.log('Signup form submitted:', data.email, data.fullName);
    
    const { error } = await signUp(data.email, data.password, data.fullName);
    
    if (error) {
      console.error('Signup error:', error);
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
        description: 'קישור לאימות נשלח לאימייל שלך. לחץ על הקישור כדי להשלים את ההרשמה.',
        duration: 8000,
      });
      console.log('Signup successful - confirmation email sent');
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
    <AuthLayout isLogin={isLogin} onToggleMode={() => setIsLogin(!isLogin)}>
      {isLogin ? (
        <LoginForm onSubmit={onLoginSubmit} />
      ) : (
        <SignupForm onSubmit={onSignupSubmit} />
      )}
    </AuthLayout>
  );
};

export default Auth;
