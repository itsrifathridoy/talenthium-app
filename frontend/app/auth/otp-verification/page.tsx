"use client";
import Button from '@/components/Button';
import AuthHeader from '@/components/AuthHeader';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassmorphicCard from '@/components/auth/GlassmorphicCard';
import { useAuthTheme } from '../layout';
import { apiClient } from '@/lib/api-client';

export default function OtpVerificationPage() {
    const { theme } = useAuthTheme();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    
    // Simple focus management for OTP inputs
    const inputs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null)
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const value = e.target.value;
        
        // Only allow digits
        if (!/^\d*$/.test(value)) {
            e.target.value = '';
            return;
        }
        
        if (value.length === 1 && idx < 5) {
            inputs[idx + 1].current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !e.currentTarget.value && idx > 0) {
            inputs[idx - 1].current?.focus();
        }
    };

    const getOtpValue = (): string => {
        return inputs.map(ref => ref.current?.value || '').join('');
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResendMessage(null);
        
        const otp = getOtpValue();
        
        if (otp.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post('/api/auth/verify-otp', {
                otp: otp,
            });
            
            // Success - redirect to login or dashboard
            router.push('/auth/login');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'OTP verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError(null);
        setResendMessage(null);
        
        try {
            await apiClient.post('/api/auth/resend-otp', {});
            setResendMessage('OTP sent to your email');
            setTimeout(() => setResendMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resend OTP');
        }
    };

    return (
        <>
            <AuthHeader title="OTP VERIFICATION" subtitle="Enter the 6-digit code sent to your email" theme={theme} />
            <GlassmorphicCard theme={theme}>
                <form className="space-y-6" onSubmit={handleVerify}>
                    {error && (
                        <div className={`p-3 rounded text-sm ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                            {error}
                        </div>
                    )}
                    {resendMessage && (
                        <div className={`p-3 rounded text-sm ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                            {resendMessage}
                        </div>
                    )}
                    <div className="flex justify-center gap-2 mb-4">
                        {inputs.map((ref, idx) => (
                            <input
                                key={idx}
                                ref={ref}
                                type="text"
                                maxLength={1}
                                className="w-12 h-14 text-3xl text-center rounded-lg bg-white/10 border border-white/20 outline-none focus:ring-2 focus:ring-neon transition-all duration-150 text-white font-bold tracking-widest placeholder-gray-400"
                                onChange={e => handleChange(e, idx)}
                                onKeyDown={e => handleKeyDown(e, idx)}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                disabled={isLoading}
                            />
                        ))}
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                </form>
                <div className="text-center mt-4 text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-teal-100'}>Didn&apos;t receive the code?{' '}</span>
                    <button 
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className={`text-neon hover:underline font-medium transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Resend
                    </button>
                </div>
                <div className="text-center mt-2 text-sm">
                    <a href="/auth/login" className={`text-neon hover:underline font-semibold transition-colors`}>Back to Login</a>
                </div>
            </GlassmorphicCard>
        </>
    );
}