
import { useLocation, useSearchParams } from 'react-router-dom';

export const useReturnUrl = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const getCurrentReturnUrl = () => {
    return location.pathname + location.search + location.hash;
  };

  const getReturnUrlFromParams = () => {
    const returnTo = searchParams.get('returnTo');
    
    // Security check: only allow internal URLs
    if (returnTo && (returnTo.startsWith('/') && !returnTo.startsWith('//'))) {
      // Prevent redirect loops to auth page
      if (returnTo.startsWith('/auth')) {
        return '/';
      }
      return returnTo;
    }
    
    return '/';
  };

  const createAuthUrl = (currentPath?: string) => {
    const pathToEncode = currentPath || getCurrentReturnUrl();
    
    // Don't encode if already on auth page
    if (pathToEncode.startsWith('/auth')) {
      return '/auth';
    }
    
    return `/auth?returnTo=${encodeURIComponent(pathToEncode)}`;
  };

  return {
    getCurrentReturnUrl,
    getReturnUrlFromParams,
    createAuthUrl
  };
};
