"use client";
import React from 'react';
import ThemeSwitcher from '@/components/auth/ThemeSwitcher';
import RadialGlow from '@/components/auth/RadialGlow';
import GridOverlay from '@/components/auth/GridOverlay';
import { AuthProvider } from '@/lib/auth-context';
// Create a context for theme
export const AuthThemeContext = React.createContext<{
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
} | null>(null);

export const useAuthTheme = () => {
  const context = React.useContext(AuthThemeContext);
  if (!context) {
    throw new Error('useAuthTheme must be used within AuthLayout');
  }
  return context;
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('talenthium-theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    try { localStorage.setItem('talenthium-theme', theme); } catch {}
  }, [theme]);

  return (
    
    <AuthProvider>
      <AuthThemeContext.Provider value={{ theme, setTheme }}>
        <div className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${theme === 'dark' 
          ? 'bg-gradient-to-br from-[#030a0d] via-[#071620] to-[#062233]' 
          : 'bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,#93c5fd_35%,#bfdbfe_75%)]'}`}> 
          <div className="absolute top-6 right-8 z-20">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
          </div>
          <RadialGlow theme={theme} />
          <GridOverlay theme={theme} />
          <div className="relative z-10 w-full flex flex-col items-center">
            {children}
            <div className={`mt-8 text-xs text-center w-full ${theme === 'dark' ? 'text-gray-500' : 'text-blue-950'}`}>
              Copyright © 2025 Talenthium. All Rights Reserved.
            </div>
          </div>
        </div>
      </AuthThemeContext.Provider>
    </AuthProvider>
  );
}
