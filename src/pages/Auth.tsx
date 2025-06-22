
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { LoginFormData, SignupFormData } from '@/components/auth/schemas';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();

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
