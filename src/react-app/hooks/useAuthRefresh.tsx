import { useAuth } from '@getmocha/users-service/react';
import { useCallback } from 'react';

export function useAuthRefresh() {
  const auth = useAuth();

  const forceRefreshUser = useCallback(async () => {
    try {
      // Clear any cached user data
      localStorage.removeItem('mocha_user_cache');
      sessionStorage.removeItem('mocha_user_cache');
      
      // Force refresh user data from API
      if (typeof (auth as any).refreshUser === 'function') {
        await (auth as any).refreshUser();
      } else {
        // Fallback: fetch fresh user data directly
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          console.log('Refreshed user data:', userData);
          
          // Force a complete page refresh to ensure all components re-render with new data
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Fallback to page refresh
      window.location.reload();
    }
  }, [auth]);

  return { forceRefreshUser };
}
