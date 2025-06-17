'use client';

import { useState } from 'react';
import { Sun, Moon, User, Settings, LogOut, UserCircle, Home } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLoading } from '../contexts/LoadingContext';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { getUserDisplayName } from '../shopping/utils/getUserName';

export default function NavBar() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { showLoading, hideLoading } = useLoading();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { useNickname, setUseNickname } = useUserPreferences();

  const handleSignOut = () => {
    signOut(() => router.push('/sign-in'));
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleAccountSetup = () => {
    router.push('/account-setup?edit=true');
    setIsProfileOpen(false);
  };

  const handleHomeClick = () => {
    showLoading('');
    
    // Small delay to show the loading animation
    setTimeout(() => {
      router.push('/');
      setIsProfileOpen(false);
      
      // Hide loading after navigation
      setTimeout(() => {
        hideLoading();
      }, 250);
    }, 250);
  };

  return (
    <nav className="bg-[#D6DBDC] dark:bg-slate-900/90 backdrop-blur-sm border-b border-gray-100/50 dark:border-gray-700/50 sticky top-0 z-40">
      <div className="max-w-sm mx-auto px-4 py-3">
        <div className="relative flex items-center justify-between">
          {/* Profile Image/Icon - Left Side */}
          <div className="relative z-20">
            <button
              onClick={handleProfileClick}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Profile menu"
            >
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || 'Profile'} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UserCircle size={24} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]">
                <div className="py-2">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      {user?.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt={user.fullName || 'Profile'} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getUserDisplayName(user, useNickname)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleAccountSetup}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                  >
                    <User size={16} />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Centered App Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={handleHomeClick}
              className="border-2 border-black/50 dark:border-white flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 pointer-events-auto"
              title="Go to Dashboard"
            >
              <Home 
                size={16} 
                className="text-black dark:text-white transition-colors duration-200" 
              />
              {/* <h1 className="text-base font-semibold text-black/90 dark:text-white transition-colors duration-200">
                Hicks Hub
              </h1> */}
            </button>
          </div>

          {/* Theme Toggle - Right Side */}
          <div className="flex items-center relative z-20">
            <button
              onClick={toggleTheme}
              className="relative flex items-center w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Currently ${resolvedTheme} mode. Tap to switch.`}
            >
              {/* Background track with icons */}
              <div className="absolute inset-1 flex items-center justify-between px-1">
                {/* Sun icon - Light mode */}
                <div className="flex items-center justify-center w-5 h-5">
                  <Sun 
                    size={14} 
                    className={`transition-colors duration-200 ${
                      resolvedTheme === 'light' 
                        ? 'text-yellow-600' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`} 
                  />
                </div>
                
                {/* Moon icon - Dark mode */}
                <div className="flex items-center justify-center w-5 h-5">
                  <Moon 
                    size={14} 
                    className={`transition-colors duration-200 ${
                      resolvedTheme === 'dark' 
                        ? 'text-blue-200' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`} 
                  />
                </div>
              </div>

              {/* Moving toggle indicator */}
              <div
                className={`
                  absolute w-5 h-5 bg-white dark:bg-gray-800 rounded-full shadow-md
                  transition-all duration-300 ease-in-out
                  flex items-center justify-center
                  ${resolvedTheme === 'dark' ? 'translate-x-7' : 'translate-x-0'}
                `}
              >
                {/* Active icon inside the toggle */}
                {resolvedTheme === 'light' ? (
                  <Sun size={12} className="text-yellow-600" />
                ) : (
                  <Moon size={12} className="text-slate-600 dark:text-blue-200" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
} 