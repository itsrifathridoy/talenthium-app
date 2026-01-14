"use client";
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/Button';
import Input from '@/components/Input';
import React, { useState } from 'react';
import AuthHeader from '@/components/AuthHeader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassmorphicCard from '@/components/auth/GlassmorphicCard';
import { useAuthTheme } from '../layout';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/lib/auth';

export default function LoginPage() {
  const { theme } = useAuthTheme();
  const { setUser, setIsAuthenticated } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.username || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 1) {
      setFormError('Please enter a valid password');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.login({
        username: formData.username,
        password: formData.password,
      });
      setUser(response.user);
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      authService.initiateGoogleLogin();
    } catch (err) {
      setFormError('Failed to initiate Google login');
    }
  };
  const handleGithubLogin = () => {
    try {
      authService.initiateGithubLogin();
    } catch (err) {
      setFormError('Failed to initiate Github login');
    }
  };
  return (
    <>
      <AuthHeader 
        title="LET'S CONNECT" 
        subtitle='WITH TALENTHIUM ECOSYSTEM' 
        theme={theme}
      />
      <GlassmorphicCard theme={theme} handleGoogleLogin={handleGoogleLogin} handleGithubLogin={handleGithubLogin}>
        <form className="space-y-4" onSubmit={handleSubmit}>
        {formError && (
          <div className={`p-3 rounded text-sm ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
            {formError}
          </div>
        )}
          <div>
            <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-50 font-medium'}`}>Username</label>
            <Input
              icon={<FaEnvelope className='text-blue-50' />}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="text-blue-50 placeholder-blue-50"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-50 font-medium'}`}>Password</label>
            <Input
              icon={<FaLock className='text-blue-50' />}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className="text-blue-50 placeholder-blue-50 pr-8"
              disabled={isLoading}
            />
            <div className="flex justify-end mt-1">
              <Link href="/auth/forgot-password" className={`text-xs hover:underline transition-colors ${theme === 'dark' ? 'text-neon' : 'text-blue-100 hover:text-white'}`}>Forgot Password?</Link>
            </div>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In Now'}
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-600' : 'border-blue-100'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-blue-600 text-blue-100'}`}>Or continue with</span>
            </div>
          </div>
          <div className="flex justify-center gap-4"></div>
        </form>
        <div className={`text-center mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-blue-100 font-medium'}`}>
          Don&apos;t have an account yet?{' '}
          <Link href="/auth/register" className={`hover:underline transition-colors ${theme === 'dark' ? 'text-neon' : 'text-white hover:text-white font-semibold'}`}>Sign Up</Link>
        </div>
      </GlassmorphicCard>
    </>
  );
}