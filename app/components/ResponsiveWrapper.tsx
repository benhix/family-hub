'use client';

import { useState, useEffect } from 'react';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
}

export default function ResponsiveWrapper({ children }: ResponsiveWrapperProps) {
  const [isWideScreen, setIsWideScreen] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsWideScreen(window.innerWidth > 625);
    };

    // Check on mount
    checkScreenWidth();

    // Add event listener for resize
    window.addEventListener('resize', checkScreenWidth);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);

  if (isWideScreen) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
            📱 Mobile Only
          </h1>
          <p className="text-black dark:text-white leading-relaxed">
            Sorry, this app is currently designed for smaller screens. Please view on a mobile phone or reduce the width of your browser until the app displays.
          </p>
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            Current width needs to be 625px or less
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 