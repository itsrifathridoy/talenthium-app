import React from 'react';

interface BackTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const BackText: React.FC<BackTextProps> = ({ children, className = '', style }) => (
  <div className={`absolute inset-0 flex items-center justify-center z-0 pointer-events-none ${className}`}>
    <span
      className="text-[120px] font-extrabold uppercase tracking-widest"
      style={{
        opacity: 0.13,
        WebkitTextStroke: '0.5px #fff',
        WebkitTextFillColor: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.15em',
        ...style,
      }}
    >
      {children}
    </span>
  </div>
);

export default BackText; 