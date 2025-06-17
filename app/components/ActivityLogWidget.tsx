'use client';

import { useActivityLog } from '@/app/contexts/ActivityLogContext';
import { useUserPreferences } from '@/app/contexts/UserPreferencesContext';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Calendar, ShoppingCart, CheckSquare, Users, Loader2, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import DynamicUserName from './DynamicUserName';

export default function ActivityLogWidget() {
  const { activities, loading, error, itemsPerPage, setItemsPerPage, refetch } = useActivityLog();
  const { lastTimeLogCleared, clearActivityLog } = useUserPreferences();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'calendar':
        return <Calendar size={12} className="text-blue-500" />;
      case 'shopping':
        return <ShoppingCart size={12} className="text-green-500" />;
      case 'tasks':
        return <CheckSquare size={12} className="text-purple-500" />;
      case 'family':
        return <Users size={12} className="text-orange-500" />;
      default:
        return <Activity size={12} className="text-gray-500" />;
    }
  };

  // Filter activities to only show those created after lastTimeLogCleared
  const filteredActivities = useMemo(() => {
    if (!lastTimeLogCleared) {
      return activities;
    }
    return activities.filter(activity => {
      // Use timestamp field and ensure proper date conversion
      const activityTime = new Date(activity.timestamp);
      const clearTime = new Date(lastTimeLogCleared);
      
      // Show activities that were created after the clear time
      return activityTime > clearTime;
    });
  }, [activities, lastTimeLogCleared]);

  // Function to clear activity log by updating user preferences
  const handleClearActivityLog = async () => {
    await clearActivityLog();
    // Refetch activities to ensure we have the latest data
    setTimeout(() => refetch(), 100);
  };

  const ActivityItem = ({ activity }: { activity: any }) => (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
      <div className="mt-1 flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
          <DynamicUserName 
            userId={activity.userId} 
            fallbackName={activity.userName}
            className="font-medium text-blue-600 dark:text-blue-400"
          />{' '}
          {activity.message}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <Activity size={24} className="mx-auto text-red-400 mb-2" />
          <p className="text-sm text-red-500 dark:text-red-400 mb-3">Error loading activities</p>
          <button
            onClick={refetch}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Try again
          </button>
        </div>
      );
    }

    if (filteredActivities.length === 0) {
      return (
        <div className="text-center py-8">
          <Activity size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      );
    }

    return (
      <div className="p-2 space-y-1">
        {filteredActivities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity size={16} className="text-indigo-500" />
          Recent Activity
        </h3>
        <div className="flex items-center gap-2">
          {filteredActivities.length > 0 && (
            <button
              onClick={handleClearActivityLog}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded-md transition-colors"
              title="Clear activity log"
            >
              <X size={14} />
            </button>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
            {filteredActivities.length}
          </span>
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Pagination Controls */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Items per page
          </span>
          <div className="flex items-center gap-1">
            {[3, 5, 10].map(count => (
              <button 
                key={count}
                onClick={() => setItemsPerPage(count)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  itemsPerPage === count 
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 