"use client";
import { FaEnvelope } from 'react-icons/fa';
import Button from '@/components/Button';
import Input from '@/components/Input';
import AuthHeader from '@/components/AuthHeader';
import GlassmorphicCard from '@/components/auth/GlassmorphicCard';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthTheme } from '../layout';
import { apiClient } from '@/lib/api-client';

export default function ForgotPasswordPage() {
    const { theme } = useAuthTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post('/api/auth/forgot-password', {
                email: email,
            });
            
            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/otp-verification');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AuthHeader title="FORGOT PASSWORD" subtitle="Reset your Talenthium account password" theme={theme} />
            <GlassmorphicCard theme={theme}>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className={`p-3 rounded text-sm ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className={`p-3 rounded text-sm ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                            Reset link sent! Redirecting...
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-300 text-sm mb-1">Email</label>
                        <Input
                            icon={<FaEnvelope className='text-teal-200' />}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email here"
                            className="text-teal-200 placeholder-teal-200"
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading || success}>
                        {isLoading ? 'Sending...' : success ? 'Sent!' : 'Send Reset Link'}
                    </Button>
                </form>
                <div className={`text-center mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-teal-100 font-medium'}`}>
                    Remembered your password?{' '}
                    <a href="/auth/login" className={`hover:underline transition-colors ${theme === 'dark' ? 'text-neon' : 'text-white hover:text-white font-semibold'}`}>Sign In</a>
                </div>
            </GlassmorphicCard>
        </>
    );
}