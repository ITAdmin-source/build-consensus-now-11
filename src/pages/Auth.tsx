
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useReturnUrl } from '@/hooks/useReturnUrl';
import { useMigrationManager } from '@/hooks/useMigrationManager';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { MigrationPreviewModal } from '@/components/MigrationPreviewModal';
import { LoginFormData, SignupFormData } from '@/components/auth/schemas';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showMigrationPreview, setShowMigrationPreview] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<SignupFormData | null>(null);
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const { getReturnUrl } = useReturnUrl();
  const { getMigrationPreview, migrationPreview, isLoading: migrationLoading } = useMigrationManager();

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
    
    // Check if guest has data to migrate
    const preview = await getMigrationPreview();
    
    if (preview?.hasData && !showMigrationPreview) {
      // Show migration preview before proceeding
      setPendingSignupData(data);
      setShowMigrationPreview(true);
      return;
    }
    
    // Proceed with signup
    const { error, migrationResult } = await signUp(data.email, data.password, data.fullName);
    
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
      console.log('Signup successful');
      
      let description = 'ברוך הבא לנקודות חיבור! אנא בדוק את האימייל שלך לאישור החשבון.';
      
      if (migrationResult?.success) {
        description = `ברוך הבא! שמרנו עבורך ${migrationResult.points_migrated} נקודות ו-${migrationResult.votes_migrated} קולות מהביקור הקודם.`;
      }
      
      toast({
        title: 'הרשמה הצליחה',
        description,
      });
      
      // Close migration preview if open
      setShowMigrationPreview(false);
      setPendingSignupData(null);
    }
  };

  const handleMigrationConfirm = async () => {
    if (pendingSignupData) {
      // Proceed with actual signup
      const { error, migrationResult } = await signUp(
        pendingSignupData.email, 
        pendingSignupData.password, 
        pendingSignupData.fullName
      );
      
      setShowMigrationPreview(false);
      setPendingSignupData(null);
      
      if (!error) {
        let description = 'ברוך הבא לנקודות חיבור!';
        
        if (migrationResult?.success) {
          description = `ברוך הבא! שמרנו עבורך ${migrationResult.points_migrated} נקודות ו-${migrationResult.votes_migrated} קולות.`;
        }
        
        toast({
          title: 'הרשמה הצליחה',
          description,
        });
      }
    }
  };

  const handleMigrationCancel = () => {
    setShowMigrationPreview(false);
    setPendingSignupData(null);
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
    <>
      <AuthLayout isLogin={isLogin} onToggleMode={() => setIsLogin(!isLogin)}>
        {isLogin ? (
          <LoginForm onSubmit={onLoginSubmit} />
        ) : (
          <SignupForm onSubmit={onSignupSubmit} />
        )}
      </AuthLayout>
      
      <MigrationPreviewModal
        isOpen={showMigrationPreview}
        onClose={handleMigrationCancel}
        onConfirm={handleMigrationConfirm}
        preview={migrationPreview}
        isLoading={migrationLoading}
      />
    </>
  );
};

export default Auth;
