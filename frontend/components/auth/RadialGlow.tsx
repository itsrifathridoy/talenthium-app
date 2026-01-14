import React from 'react';

interface RadialGlowProps {
  theme: 'light' | 'dark';
}

const RadialGlow: React.FC<RadialGlowProps> = ({ theme }) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] ${
          theme === 'dark'
            ? 'bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)]'
            : 'bg-[radial-gradient(circle,rgba(37,99,235,0.7)_0%,transparent_95%)]'
        }`}
      ></div>
    </div>
  );
};

export default RadialGlow;
