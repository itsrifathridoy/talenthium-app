import React from 'react';

interface ThemeSwitcherProps {
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  return (
    <button
      aria-label="Switch Theme"
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow hover:scale-105 transition-all duration-200 ${
        theme === 'dark' 
          ? 'border-white/20 bg-glass backdrop-blur-md' 
          : 'border-green-300 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl'
      }`}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="#13ff8c"/></svg>
      ) : (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#facc15"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#facc15" strokeWidth="2"/></svg>
      )}
    </button>
  );
};

export default ThemeSwitcher;
