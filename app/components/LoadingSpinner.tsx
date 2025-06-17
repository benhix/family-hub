'use client';

import { ClipLoader } from 'react-spinners';
import { useLoading } from '../contexts/LoadingContext';

export default function LoadingSpinner() {
  const { isLoading, message } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
      {/* Animated spinner from react-spinners */}
      <div className="flex flex-col items-center gap-4">
        <ClipLoader
          color="#3b82f6"
          loading={isLoading}
          size={40}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
} 