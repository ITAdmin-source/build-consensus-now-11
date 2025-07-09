
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
  const { getReturnUrlFromParams } = useReturnUrl();

  // Redirect authenticated users to return URL or home
  useEffect(() => {
    if (user && !loading) {
      const returnUrl = getReturnUrlFromParams();
      navigate(returnUrl);
    }
  }, [user, loading, navigate, getReturnUrlFromParams]);

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
      // Navigation will be handled by useEffect when user state updates
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
        description: 'בדוק את האימייל שלך לאימות החשבון (או התחבר ישירות אם אימות אימייל מבוטל)',
      });
      console.log('Signup successful - check email for verification or login directly if email confirmation is disabled');
      // If email confirmation is disabled, user will be automatically logged in
      // and the useEffect will handle navigation
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#66c8ca]/8 via-white to-[#1a305b]/5 flex items-center justify-center">
        <div className="text-center hebrew-text">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ec0081] mx-auto mb-4"></div>
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
