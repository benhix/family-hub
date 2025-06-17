'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Settings, Info } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';

interface WorkEntry {
  date: string; // YYYY-MM-DD format
  status: 'Office' | 'Home' | 'Off' | 'Unsure' | '';
}

interface WeekData {
  [key: string]: WorkEntry; // key is date string
}

const WORK_STATUS_OPTIONS = ['Office', 'Home', 'Off', 'Unsure'] as const;

// Helper function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes <= 10) {
    // Count every minute for first 10 minutes
    if (diffMinutes <= 1) {
      return '1 minute ago';
    }
    return `${diffMinutes} minutes ago`;
  } else if (diffMinutes <= 30) {
    // Show "a few minutes ago" from 11-30 minutes
    return 'a few minutes ago';
  } else if (diffMinutes < 60) {
    // Show "less than an hour ago" from 31-59 minutes
    return 'less than an hour ago';
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
};

// Helper function to get the appropriate work week
const getWorkWeek = (date: Date) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // If it's Saturday (6) or Sunday (0), show next week
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const nextMonday = startOfWeek(addWeeks(date, 1), { weekStartsOn: 1 });
    return nextMonday;
  }
  
  // Otherwise show current week
  return startOfWeek(date, { weekStartsOn: 1 });
};

export default function WorkTrackingWidget() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => 
    getWorkWeek(new Date()) // Always use current date logic
  );
  const [weekData, setWeekData] = useState<WeekData>({});
  const [loading, setLoading] = useState(true);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday
      dates.push(addDays(currentWeekStart, i));
    }
    return dates;
  }, [currentWeekStart]);

  const weekRange = useMemo(() => {
    const start = format(currentWeekStart, 'MMM d');
    const end = format(addDays(currentWeekStart, 4), 'MMM d'); // Friday is 4 days after Monday
    return `${start} - ${end}`;
  }, [currentWeekStart]);

  // Load work data
  useEffect(() => {
    loadWeekData();
  }, [currentWeekStart]);

  // Reset to current work week on component mount and periodically
  useEffect(() => {
    const resetToCurrentWeek = () => {
      const currentWorkWeek = getWorkWeek(new Date());
      setCurrentWeekStart(currentWorkWeek);
    };

    // Reset immediately
    resetToCurrentWeek();

    // Reset every hour to handle day changes
    const interval = setInterval(resetToCurrentWeek, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Update relative time display every minute
  useEffect(() => {
    if (!lastUpdated) return;

    const interval = setInterval(() => {
      // Force re-render to update the relative time display
      setLastUpdated(prev => prev ? new Date(prev.getTime()) : null);
    }, 60 * 1000); // Update every minute

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const loadWeekData = async () => {
    try {
      setLoading(true);
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const response = await fetch(`/api/work-tracking?weekStart=${startDate}`);
      if (response.ok) {
        const data = await response.json();
        setWeekData(data.weekData || {});
        
        // Find the most recent timestamp from the week data
        const timestamps = Object.values(data.weekData || {})
          .map((entry: any) => entry.timestamp)
          .filter(Boolean)
          .map((ts: string) => new Date(ts));
        
        if (timestamps.length > 0) {
          const mostRecent = new Date(Math.max(...timestamps.map(d => d.getTime())));
          setLastUpdated(mostRecent);
        }
      }
    } catch (error) {
      console.error('Error loading work data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkStatus = async (date: string, status: string) => {
    try {
      const response = await fetch('/api/work-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          status: status === weekData[date]?.status ? '' : status, // Toggle off if same
        }),
      });

      if (response.ok) {
        const updatedEntry = await response.json();
        setWeekData(prev => ({
          ...prev,
          [date]: updatedEntry.data,
        }));
        
        // Update the last updated timestamp
        setLastUpdated(new Date(updatedEntry.data.timestamp));
      }
    } catch (error) {
      console.error('Error updating work status:', error);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'prev' ? subWeeks(currentWeekStart, 1) : addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const currentWeek = getWorkWeek(new Date());
    setCurrentWeekStart(currentWeek);
  };

  const handleDoneClick = () => {
    setShowWeekModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Office': return 'bg-blue-500';
      case 'Home': return 'bg-green-500';
      case 'Off': return 'bg-gray-400';
      case 'Unsure': return 'bg-orange-500';
      default: return 'bg-gray-200 dark:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Office': return 'Office';
      case 'Home': return 'Home';
      case 'Off': return 'Off';
      case 'Unsure': return 'Unsure';
      default: return '?';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            📅 Ben&apos;s Week
          </h3>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              📅 Ben&apos;s Week
            </h3>
            <div className="relative">
              <button
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                onBlur={() => setTimeout(() => setShowInfoTooltip(false), 150)}
              >
                <Info size={15} className="text-gray-600 dark:text-gray-400" />
              </button>
              
              {/* Speech Bubble Tooltip */}
              {showInfoTooltip && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 z-50">
                  <div className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 text-xs rounded-lg px-4 py-3 shadow-lg w-64 relative">
                    {/* Arrow pointing down */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-200 dark:bg-gray-600 rotate-45"></div>
                                          <p className="leading-relaxed">
                        Forecast of what Ben is doing each working day for the week:
                        <br />
                        <br />- Off is not working
                        <br />- Office is at the office
                        <br />- Home is working at home
                        <br />- Unsure is TBD
                      </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {weekRange}
            </span>
            <button
              onClick={() => setShowWeekModal(true)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings size={14} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Compact Week Bar */}
        <div className="flex items-center justify-between gap-1 mb-3">
          {weekDates.map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayName = format(date, 'EEE');
            const currentStatus = weekData[dateStr]?.status || '';
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

            return (
              <div key={dateStr} className="flex flex-col items-center gap-1 flex-1">
                <span className={`text-[10px] font-medium ${
                  isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {dayName[0]}
                </span>
                <div className={`w-full px-1 py-1 rounded text-center text-[9px] font-medium ${
                  currentStatus 
                    ? `text-white ${getStatusColor(currentStatus)}` 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                } ${isToday ? 'ring-1 ring-blue-300 dark:ring-blue-600' : ''}`}>
                  {getStatusText(currentStatus)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Last Updated */}
        {lastUpdated && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Updated {formatRelativeTime(lastUpdated)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Week Modal with Status Editing */}
      {showWeekModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-80 mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Work Week
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              {weekRange}
            </div>

            {/* Week Days with Status Selection */}
            <div className="space-y-3 mb-6">
              {weekDates.map((date, index) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayName = format(date, 'EEEE');
                const dayNum = format(date, 'MMM d');
                const currentStatus = weekData[dateStr]?.status || '';
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

                return (
                  <div
                    key={dateStr}
                    className={`p-3 rounded-lg border ${
                      isToday 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className={`font-medium text-sm ${
                          isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {dayName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {dayNum}
                        </div>
                      </div>
                      {currentStatus && (
                        <div className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          getStatusColor(currentStatus)
                        }`}>
                          {currentStatus}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {WORK_STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateWorkStatus(dateStr, status)}
                          className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                            currentStatus === status
                              ? `text-white ${getStatusColor(status)}`
                              : 'bg-white dark:bg-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-500 border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {status === 'Office' ? 'Off.' : status === 'Home' ? 'Home' : status === 'Unsure' ? 'Uns.' : status}
                        </button>
                      ))}
                      {currentStatus && (
                        <button
                          onClick={() => updateWorkStatus(dateStr, '')}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 mb-4">
              <button
                onClick={goToCurrentWeek}
                className="w-full p-2 text-sm rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                Go to Current Week
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleDoneClick}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 