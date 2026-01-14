import React from 'react';

interface AuthHeaderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string,
  subtitle: string,
  theme: 'light' | 'dark'; // Added theme property
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle, theme, ...props }) => (
    <div className="relative flex flex-col items-center mb-8 mt-6 w-full max-w-2xl">
    {/* Back text effect */}
    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
      <span
        className={`text-[100px] font-extrabold uppercase tracking-widest ${theme === 'light' ? 'text-green-500' : ''}`}
        style={{
          opacity: 0.13,
          WebkitTextStroke: '0.5px #fff',
          WebkitTextFillColor: theme === 'light' ? 'oklch(-0.197 0.219 144.579)' : 'rgba(255,255,255,0.5)',
          letterSpacing: '0.15em',
        }}
      >
        TALENTHIUM
      </span>
    </div>
    {/* Main heading */}
    <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 drop-shadow-lg" style={{letterSpacing: '0.03em'}}>
      {title}
    </h2>
    <h3 className="text-md font-extrabold text-transparent bg-clip-text bg-white drop-shadow-lg text-center" style={{letterSpacing: '0.01em'}}>
      {subtitle}
    </h3>
  </div>
);

export default AuthHeader;