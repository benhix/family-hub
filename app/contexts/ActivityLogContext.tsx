'use client';

import React, { createContext, useContext, useState } from 'react';
import { ActivityLogEntry, CreateActivityRequest } from '@/app/types/activity';
import { useActivities } from '@/app/hooks/useActivities';

interface ActivityLogContextType {
  activities: ActivityLogEntry[];
  loading: boolean;
  error: string | null;
  addActivity: (message: string, type: ActivityLogEntry['type'], userName: string, userId: string) => Promise<void>;
  clearActivities: () => Promise<void>;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  refetch: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export function useActivityLog() {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
}

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const [itemsPerPage, setItemsPerPage] = useState(3); // Default to 3 items
  const { activities, loading, error, addActivity: dbAddActivity, clearAllActivities, refetch } = useActivities(itemsPerPage, 0);

  const addActivity = async (message: string, type: ActivityLogEntry['type'], userName: string, userId: string) => {
    try {
      const activityData: CreateActivityRequest = {
        message,
        type,
        userName,
        userId,
      };
      await dbAddActivity(activityData);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const clearActivities = async () => {
    try {
      await clearAllActivities();
    } catch (error) {
      console.error('Error clearing activities:', error);
    }
  };

  return (
    <ActivityLogContext.Provider value={{ 
      activities, 
      loading, 
      error, 
      addActivity, 
      clearActivities, 
      itemsPerPage, 
      setItemsPerPage,
      refetch 
    }}>
      {children}
    </ActivityLogContext.Provider>
  );
} 