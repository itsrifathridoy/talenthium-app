"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MdLockOutline } from "react-icons/md";
import { useAuth } from "@/lib/auth-context";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  console.log(user);
  const router = useRouter();
  const pathname = usePathname();

  // Check if the current route is in the auth section
  const isAuthRoute = pathname?.startsWith('/auth');
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/protfolio', '/'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));
  
  // Define protected route prefixes
  const protectedPrefixes = [
    '/dashboard',
    '/profile',
    '/interviews',
    '/jobs',
    '/mentorship',
    '/projects',
    '/call',
  ];
  const isProtectedRoute = !isAuthRoute && !isPublicRoute && protectedPrefixes.some((p) => pathname === p || pathname?.startsWith(p + '/'));

  useEffect(() => {
    // Wait until auth state is initialized to avoid flicker/false redirects
    if (!isInitialized) return;

    // If on auth route and authenticated, redirect to dashboard
    if (isAuthRoute && isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    // If authenticated, allow access without forcing a client navigation
    if (!isAuthRoute && isAuthenticated) {
      return; // no-op
    }

    // Only guard protected routes when not authenticated
    if (isProtectedRoute && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isInitialized, isAuthRoute, isProtectedRoute, isAuthenticated, router, pathname, isPublicRoute]);

  // While initializing auth, render a lightweight loader to avoid showing login first
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If not on auth route and not authenticated, show loading/redirect message
  if (isProtectedRoute && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MdLockOutline className="text-blue-500" size={48} />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If on auth route and authenticated, show loading while redirecting
  if (isAuthRoute && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // For auth routes when not authenticated or protected routes when authenticated, render the children
  return <>{children}</>;
};

export default AuthWrapper;
