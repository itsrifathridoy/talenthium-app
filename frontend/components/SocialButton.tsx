import React from 'react';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, children, className = '', ...props }) => (
  <button
    className={`flex items-center justify-center gap-3 w-full py-2 rounded-full border border-white/10 bg-white/10 hover:bg-white/20 transition text-white font-semibold ${className}`}
    {...props}
  >
    {icon}
    {children}
  </button>
);

export default SocialButton; 