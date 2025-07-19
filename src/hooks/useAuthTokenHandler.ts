
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthTokenHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthTokens = async () => {
      const hash = location.hash;
      
      // Check if we have auth tokens in the URL fragment
      if (!hash || (!hash.includes('access_token=') && !hash.includes('error='))) {
        return;
      }

      setIsProcessing(true);
      console.log('Processing auth tokens from URL fragment');

      try {
        // Parse the URL fragment parameters
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const tokenType = params.get('token_type');
        const type = params.get('type');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        // Handle error cases
        if (error) {
          console.error('Auth error from URL:', error, errorDescription);
          toast.error(`שגיאת אימות: ${errorDescription || error}`);
          
          // Clean up URL and redirect
          navigate('/', { replace: true });
          return;
        }

        // Handle successful token exchange
        if (accessToken && refreshToken && tokenType === 'bearer') {
          console.log('Setting session from URL tokens');
          
          // Set the session using the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            toast.error('שגיאה באימות המשתמש');
          } else if (data.session) {
            console.log('Session established successfully');
            
            // Show appropriate success message based on type
            if (type === 'signup') {
              toast.success('חשבונך אומת בהצלחה! ברוך הבא לאפליקציה');
            } else {
              toast.success('התחברת בהצלחה');
            }
          }
        }

        // Clean up the URL by removing the hash
        navigate(location.pathname + location.search, { replace: true });

      } catch (error) {
        console.error('Error processing auth tokens:', error);
        toast.error('שגיאה בעיבוד אימות המשתמש');
        
        // Clean up URL even on error
        navigate('/', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthTokens();
  }, [location.hash, location.pathname, location.search, navigate]);

  return { isProcessing };
};
