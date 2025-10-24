import React from 'react';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const headerClasses = theme === 'light' ? 'bg-neutral-200' : 'bg-neutral-800';
  const titleClasses = theme === 'light' ? 'text-neutral-900' : 'text-neutral-100';
  const subtitleClasses = theme === 'light' ? 'text-neutral-600' : 'text-neutral-400';
  const buttonClasses = theme === 'light' 
    ? 'text-neutral-600 hover:bg-neutral-300 focus:ring-offset-neutral-200' 
    : 'text-neutral-400 hover:bg-neutral-700 focus:ring-offset-neutral-800';

  const textShadowStyle = theme === 'light'
    ? { textShadow: '-1px -1px 1px rgba(255,255,255,0.8), 1px 1px 1px rgba(0,0,0,0.2)' }
    : { textShadow: '-1px -1px 1px rgba(0,0,0,0.4), 1px 1px 1px rgba(255,255,255,0.1)' };

  return (
    <header className={`${headerClasses} shadow-md`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
            <h1
              className={`text-3xl font-bold ${titleClasses} tracking-wider`}
              style={{ fontFamily: 'cursive', ...textShadowStyle }}
            >
              Character Card Creator
            </h1>
            <p className={`${subtitleClasses} mt-1 italic tracking-widest`}>
              Create and embed character data within PNG images.
            </p>
        </div>
        <div className="flex-1 flex justify-end">
            <button
                onClick={toggleTheme}
                className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${buttonClasses}`}
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;