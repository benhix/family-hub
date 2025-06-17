'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface DismissibleAlertProps {
  alertId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

export default function DismissibleAlert({ 
  alertId, 
  title, 
  message, 
  type = 'info',
  icon 
}: DismissibleAlertProps) {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  // Check if alert should be shown when component mounts
  useEffect(() => {
    const checkAlertVisibility = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user-preferences?alertId=${alertId}`);
        if (response.ok) {
          const data = await response.json();
          // Show alert if it hasn't been dismissed
          setIsVisible(!data.dismissed);
        } else {
          // If no preference found, show the alert
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking alert visibility:', error);
        // Default to showing the alert if there's an error
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAlertVisibility();
  }, [user?.id, alertId]);

  const handleDismiss = async () => {
    if (!user?.id || isDismissing) return;

    setIsDismissing(true);

    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          dismissed: true,
        }),
      });

      if (response.ok) {
        // Animate out and then hide
        setIsVisible(false);
      } else {
        console.error('Failed to save alert dismissal');
        setIsDismissing(false);
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
      setIsDismissing(false);
    }
  };

  // Don't render anything while loading or if not visible
  if (isLoading || !isVisible) {
    return null;
  }

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-700',
          icon: 'text-emerald-600 dark:text-emerald-400',
          title: 'text-emerald-900 dark:text-emerald-100',
          message: 'text-emerald-700 dark:text-emerald-200',
          button: 'text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-200'
        };
      case 'warning':
        return {
          container: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700',
          icon: 'text-amber-600 dark:text-amber-400',
          title: 'text-amber-900 dark:text-amber-100',
          message: 'text-amber-700 dark:text-amber-200',
          button: 'text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200'
        };
      case 'error':
        return {
          container: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-900 dark:text-red-100',
          message: 'text-red-700 dark:text-red-200',
          button: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200'
        };
      default: // info
        return {
          container: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-900 dark:text-blue-100',
          message: 'text-blue-700 dark:text-blue-200',
          button: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div 
      className={`
        mx-4 mb-4 p-4 rounded-xl border shadow-sm transition-all duration-300 ease-in-out
        ${styles.container}
        ${isDismissing ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {icon || <Sparkles size={20} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${styles.title}`}>
            {title}
          </h4>
          <div className={`text-sm mt-1 ${styles.message}`}>
            {message.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;
              
              // Check if line starts with a dash (bullet point)
              if (trimmedLine.startsWith('-')) {
                return (
                  <div key={index} className="flex items-start gap-2 mt-1">
                    <span className="text-xs mt-0.5">•</span>
                    <span>{trimmedLine.substring(1).trim()}</span>
                  </div>
                );
              }
              
              // Regular line
              return (
                <div key={index} className={index > 0 ? 'mt-1' : ''}>
                  {trimmedLine}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          disabled={isDismissing}
          className={`
            flex-shrink-0 p-1 rounded-full transition-all duration-200
            ${styles.button}
            ${isDismissing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30 dark:hover:bg-black/20'}
          `}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
} 