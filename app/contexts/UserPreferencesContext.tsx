'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useUserPreferencesApi } from '../hooks/useUserPreferencesApi';
import { UserPreferences, DEFAULT_USER_PREFERENCES } from '../types/userPreferences';

interface UserPreferencesContextType {
  // Current preferences
  useNickname: boolean;
  compactMode: boolean;
  showCompletedItems: boolean;
  shoppingReminders: boolean;
  calendarNotifications: boolean;
  backgroundStyle: string;
  lastTimeLogCleared?: Date;
  shoppingWidgetDate?: Date;
  
  // Loading state
  loading: boolean;
  error: string | null;
  
  // Update functions
  setUseNickname: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
  setShowCompletedItems: (value: boolean) => void;
  setShoppingReminders: (value: boolean) => void;
  setCalendarNotifications: (value: boolean) => void;
  setBackgroundStyle: (value: string) => void;
  clearActivityLog: () => Promise<void>;
  setShoppingWidgetDate: (value: Date) => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { preferences, loading, error, updatePreferences } = useUserPreferencesApi();

  // Get current preferences with fallbacks
  const currentPrefs = preferences || DEFAULT_USER_PREFERENCES;

  // Individual setter functions that update the database
  const setUseNickname = useCallback(async (value: boolean) => {
    await updatePreferences({ useNickname: value });
  }, [updatePreferences]);

  const setCompactMode = useCallback(async (value: boolean) => {
    await updatePreferences({ compactMode: value });
  }, [updatePreferences]);

  const setShowCompletedItems = useCallback(async (value: boolean) => {
    await updatePreferences({ showCompletedItems: value });
  }, [updatePreferences]);

  const setShoppingReminders = useCallback(async (value: boolean) => {
    await updatePreferences({ shoppingReminders: value });
  }, [updatePreferences]);

  const setCalendarNotifications = useCallback(async (value: boolean) => {
    await updatePreferences({ calendarNotifications: value });
  }, [updatePreferences]);

  const setBackgroundStyle = useCallback(async (value: string) => {
    await updatePreferences({ backgroundStyle: value });
  }, [updatePreferences]);

  const clearActivityLog = useCallback(async () => {
    await updatePreferences({ lastTimeLogCleared: new Date() });
  }, [updatePreferences]);

  const setShoppingWidgetDate = useCallback(async (value: Date) => {
    await updatePreferences({ shoppingWidgetDate: value });
  }, [updatePreferences]);

  const value = {
    useNickname: currentPrefs.useNickname,
    compactMode: currentPrefs.compactMode || false,
    showCompletedItems: currentPrefs.showCompletedItems ?? true,
    shoppingReminders: currentPrefs.shoppingReminders ?? true,
    calendarNotifications: currentPrefs.calendarNotifications || false,
    backgroundStyle: currentPrefs.backgroundStyle || 'default',
    lastTimeLogCleared: currentPrefs.lastTimeLogCleared,
    shoppingWidgetDate: currentPrefs.shoppingWidgetDate,
    loading,
    error,
    setUseNickname,
    setCompactMode,
    setShowCompletedItems,
    setShoppingReminders,
    setCalendarNotifications,
    setBackgroundStyle,
    clearActivityLog,
    setShoppingWidgetDate,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
} 