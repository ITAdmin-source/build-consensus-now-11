
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useReturnUrl = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const createAuthUrl = useCallback((basePath: string = '/auth') => {
    const currentPath = location.pathname + location.search + location.hash;
    
    // Don't create return URL if already on auth page or home page
    if (currentPath === '/auth' || currentPath === '/') {
      return basePath;
    }
    
    const returnTo = encodeURIComponent(currentPath);
    return `${basePath}?returnTo=${returnTo}`;
  }, [location]);

  const getReturnUrl = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo');
    
    if (!returnTo) {
      return '/';
    }
    
    const decodedUrl = decodeURIComponent(returnTo);
    
    // Security check: ensure URL is internal and not auth page
    if (!decodedUrl.startsWith('/') || decodedUrl === '/auth') {
      return '/';
    }
    
    return decodedUrl;
  }, [location.search]);

  const navigateToReturnUrl = useCallback(() => {
    const returnUrl = getReturnUrl();
    navigate(returnUrl);
  }, [getReturnUrl, navigate]);

  return {
    createAuthUrl,
    getReturnUrl,
    navigateToReturnUrl
  };
};
