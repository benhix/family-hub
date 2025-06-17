'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
  className?: string;
}

export default function ThemeToggle({ 
  size = 'md', 
  variant = 'button',
  className = '' 
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`${sizeClasses[size]} rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun size={iconSizes[size]} className="text-yellow-500" />
        ) : (
          <Moon size={iconSizes[size]} className="text-slate-600 dark:text-slate-300" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} px-4 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors flex items-center space-x-2 ${className}`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <>
          <Sun size={iconSizes[size]} className="text-yellow-500" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={iconSizes[size]} className="text-slate-600 dark:text-slate-300" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
} 