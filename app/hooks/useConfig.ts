import { useState, useEffect, useCallback } from 'react';
import { Config } from '../types/config';

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/config');
      const result = await response.json();
      
      if (result.success) {
        // Convert string dates back to Date objects
        const configWithDates = {
          ...result.data,
          nextShopDate: result.data.nextShopDate ? new Date(result.data.nextShopDate) : undefined,
        };
        setConfig(configWithDates);
      } else {
        setError(result.error || 'Failed to fetch config');
      }
    } catch (err) {
      setError('Failed to fetch config');
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (name: string, value: any) => {
    try {
      setError(null);
      
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, value }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Convert string dates back to Date objects
        const configWithDates = {
          ...result.data,
          nextShopDate: result.data.nextShopDate ? new Date(result.data.nextShopDate) : undefined,
        };
        setConfig(configWithDates);
        return true;
      } else {
        setError(result.error || 'Failed to update config');
        return false;
      }
    } catch (err) {
      setError('Failed to update config');
      console.error('Error updating config:', err);
      return false;
    }
  }, []);

  const setNextShopDate = useCallback(async (date: Date) => {
    return await updateConfig('nextShopDate', date);
  }, [updateConfig]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    setNextShopDate,
    updateConfig,
  };
} 