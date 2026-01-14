import React from 'react'

export function GlassCard({ children, className = "", theme = 'dark' }: { children: React.ReactNode; className?: string; theme?: 'light' | 'dark' }) {
    return (
      <div className={`border backdrop-blur-md shadow-xl rounded-2xl p-8 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10' 
          : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-2xl'
      } ${className}`}>
        {children}
      </div>
    );
  }
