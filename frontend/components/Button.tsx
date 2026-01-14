import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => (
  <button
    className={`w-full py-3 mt-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-[6px] relative overflow-hidden text-white font-extrabold text-xl shadow-[0_4px_24px_0_rgba(37,99,235,0.15)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#2563eb]/80 before:via-[#3b82f6]/60 before:to-[#1e40af]/80 before:opacity-60 before:pointer-events-none hover:before:opacity-80 transition-all duration-200 ${className}`}
    {...props}
  >
    <span className="relative z-10 text-white/80 drop-shadow-[0_2px_8px_rgba(37,99,235,0.25)]">{children}</span>
  </button>
);

export default Button; 