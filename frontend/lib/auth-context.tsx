'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { authService } from './auth';
import { api } from './axios';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  setUser: (user: User) => void;
  clearUser: () => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const current = await authService.getCurrentUser();
        if (current) {
          setIsAuthenticated(true);
          setUser(current);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      fetchMe();
    }
  }, [isInitialized]);

  useLayoutEffect(() => {
    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Only attempt refresh for 401 errors and if not already retrying
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
          originalRequest._retry = true;
          setIsRefreshing(true);
          
          try {
            await authService.refresh();
            setIsRefreshing(false);
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            setIsRefreshing(false);
            
            // Check if refresh token is invalid
            if (refreshError instanceof Error && refreshError.message === 'REFRESH_TOKEN_INVALID') {
              setIsAuthenticated(false);
              setUser(null);
              router.push('/auth/login');
              return Promise.reject(new Error('Session expired. Please log in again.'));
            }
            
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, [isRefreshing, router]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isInitialized,
    setUser: (user: User) => {
      setUser(user);
      setIsAuthenticated(true);
    },
    setIsAuthenticated,
    clearUser: async () => {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setUser(null);
        setIsAuthenticated(false);
        router.push('/auth/login');
      }
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
