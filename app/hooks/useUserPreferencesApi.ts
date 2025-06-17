import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, UpdateUserPreferencesRequest } from '../types/userPreferences';

// Hook for fetching and managing user preferences
export function useUserPreferencesApi() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user-preferences');
      const result = await response.json();
      
      if (result.success) {
        setPreferences(result.data);
      } else {
        setError(result.error || 'Failed to fetch preferences');
      }
    } catch (err) {
      setError('Failed to fetch preferences');
      console.error('Error fetching user preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (updates: UpdateUserPreferencesRequest): Promise<UserPreferences | null> => {
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      
      if (result.success) {
        setPreferences(result.data);
        return result.data;
      } else {
        console.error('Failed to update preferences:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return { 
    preferences, 
    setPreferences, 
    loading, 
    error, 
    refetch: fetchPreferences,
    updatePreferences 
  };
} 