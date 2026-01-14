import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import SocialButton from '../SocialButton';

interface GlassmorphicCardProps {
  theme: 'light' | 'dark';
  children?: React.ReactNode;
  handleGoogleLogin: () => void;
  handleGithubLogin: () => void;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ theme,handleGoogleLogin, handleGithubLogin, children }) => {
  return (
    <div
      className={`relative overflow-hidden z-10 w-full max-w-xl rounded-2xl p-8 border backdrop-blur-2xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-glass border-white/10 shadow-xl'
          : [
              'bg-gradient-to-br from-[rgba(30,64,175,0.92)] via-[rgba(37,99,235,0.88)] to-[rgba(29,78,216,0.90)]',
              'border-blue-800/40',
              'shadow-[0_8px_32px_-4px_rgba(37,99,235,0.4),0_1px_3px_rgba(0,0,0,0.12)]',
              'ring-1 ring-blue-600/30',
            ].join(' ')
      }`}
    >
      <div className="flex flex-col gap-3 mb-6">
        <SocialButton
          icon={<FcGoogle className="text-2xl" />}
          className="text-blue-950 hover:text-blue-900"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </SocialButton>
        <SocialButton
          icon={<FaGithub className="text-2xl" />}
          className="text-blue-950 hover:text-blue-900"
          onClick={handleGithubLogin}
        >
          Continue with GitHub
        </SocialButton>
      </div>
      <div className="flex items-center my-4">
        <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-300/70'} transition-colors`} />
        <span
          className={`mx-3 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-blue-100 font-semibold'}`}
        >
          or
        </span>
        <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-300/70'} transition-colors`} />
      </div>
      {children && <div>{children}</div>}
    </div>
  );
};

export default GlassmorphicCard;
