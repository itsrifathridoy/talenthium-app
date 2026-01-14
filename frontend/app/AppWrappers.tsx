'use client';
import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/lib/auth-context';

const _NoSSR = ({ children }: { children: ReactNode }) => <React.Fragment>{children}</React.Fragment>;

const NoSSR = dynamic(() => Promise.resolve(_NoSSR), {
  ssr: false,
});

export default function AppWrappers({ children }: { children: ReactNode }) {
  return (
    <NoSSR>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NoSSR>
  );
}
