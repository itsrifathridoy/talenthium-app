'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/lib/auth';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get current user info from backend (cookies already set)
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
          router.push('/dashboard');
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('OAuth callback failed:', error);
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [router, setUser, setIsAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Completing your login...</p>
      </div>
    </div>
  );
}
