import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ icon, type, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2 transition-colors duration-200 relative">
      {icon && <span className="mr-2 text-gray-500">{icon}</span>}
      <input
        type={isPassword && showPassword ? 'text' : type}
        className={`bg-transparent outline-none text-gray-400 placeholder-gray-500 flex-1 ${className}`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      )}
    </div>
  );
};

export default Input; 