
import React from 'react';

interface Props {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<Props> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white transition-colors border border-neutral-200 dark:border-neutral-800 shadow-sm"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 m-8 0a4 4 0 108 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};


