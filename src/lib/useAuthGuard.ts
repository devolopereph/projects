'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export function useAuthGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  // Global fetch interceptor for 401 errors
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check if this is an API call and if it returned 401
      if (response.status === 401 && args[0]?.toString().includes('/api/')) {
        console.log('401 Unauthorized detected, logging out...');
        
        // Show toast only once
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error('Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.');
        }
        
        // Sign out and redirect to login
        setTimeout(() => {
          signOut({ 
            callbackUrl: '/admin/login',
            redirect: true 
          });
        }, 1000);
      }
      
      return response;
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: !!session
  };
}