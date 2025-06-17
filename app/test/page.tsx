import { useUser } from '@clerk/nextjs';
import NavBar from '../components/NavBar';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <NavBar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Test Page
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              This page is for testing navigation and dropdown functionality.
            </p>
            <div className="mt-6 space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                • Test the profile dropdown in the top-left
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                • Test the home button in the center
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                • Test the theme toggle in the top-right
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 