'use client';

import { useState, useEffect } from 'react';
import { ActivityLogEntry, CreateActivityRequest } from '@/app/types/activity';

export function useActivities(limit: number = 10, offset: number = 0) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activities?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const data = await response.json();
      // Convert timestamp strings back to Date objects
      const activitiesWithDates = data.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
        createdAt: new Date(activity.createdAt),
        updatedAt: new Date(activity.updatedAt),
      }));
      setActivities(activitiesWithDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activityData: CreateActivityRequest) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        throw new Error('Failed to create activity');
      }

      const newActivity = await response.json();
      const activityWithDates = {
        ...newActivity,
        timestamp: new Date(newActivity.timestamp),
        createdAt: new Date(newActivity.createdAt),
        updatedAt: new Date(newActivity.updatedAt),
      };

      setActivities(prev => [activityWithDates, ...prev]);
      return activityWithDates;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create activity');
      throw err;
    }
  };

  const clearAllActivities = async () => {
    try {
      const response = await fetch('/api/activities', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear activities');
      }

      setActivities([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear activities');
      throw err;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [limit, offset]);

  return {
    activities,
    loading,
    error,
    addActivity,
    clearAllActivities,
    refetch: fetchActivities,
  };
} 