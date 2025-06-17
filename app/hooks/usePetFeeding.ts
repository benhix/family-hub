import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserDisplayName } from './useUserDisplayName';

interface TodayStatus {
  dog: { morning: boolean; evening: boolean };
  cat: { morning: boolean; evening: boolean };
}

interface FeedingRecord {
  id: string;
  petType: 'dog' | 'cat';
  mealTime: 'morning' | 'evening';
  fed: boolean;
  date: string;
  triggeredBy: string;
  timestamp: string;
}

export function usePetFeeding(days: number = 1) {
  const { user } = useUser();
  const userDisplayName = useUserDisplayName();
  const [todayStatus, setTodayStatus] = useState<TodayStatus>({
    dog: { morning: false, evening: false },
    cat: { morning: false, evening: false }
  });
  const [feedingHistory, setFeedingHistory] = useState<FeedingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastResetDate, setLastResetDate] = useState<string>('');

  const fetchFeedingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pet-feeding?days=${days}`);
      const data = await response.json();
      
      if (data.todayStatus) {
        setTodayStatus(data.todayStatus);
      }
      
      if (data.feedingRecords) {
        setFeedingHistory(data.feedingRecords);
      }

      // Update last reset date
      if (data.currentDate) {
        setLastResetDate(data.currentDate);
      }
    } catch (error) {
      console.error('Error fetching feeding data:', error);
    } finally {
      setLoading(false);
    }
  }, [days]);

  const updateFeedingStatus = useCallback(async (
    petType: 'dog' | 'cat', 
    mealTime: 'morning' | 'evening', 
    fed: boolean
  ) => {
    try {
      const response = await fetch('/api/pet-feeding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petType,
          mealTime,
          fed,
          triggeredBy: userDisplayName,
          triggeredByUserId: user?.id,
        }),
      });

      if (response.ok) {
        // Update local state immediately for responsive UI
        setTodayStatus(prev => ({
          ...prev,
          [petType]: {
            ...prev[petType],
            [mealTime]: fed
          }
        }));
        
        // Refresh data to get latest history
        await fetchFeedingData();
      }
    } catch (error) {
      console.error('Error updating feeding status:', error);
    }
  }, [userDisplayName, user?.id, fetchFeedingData]);

  const getCurrentMealTime = useCallback(() => {
    // Morning: 6am to 3pm (6-14 hours)
    // Evening: 3pm to 6am (15-23 hours and 0-5 hours)
    // Use Adelaide time (UTC+10:30/+9:30 depending on daylight saving)
    const adelaideTime = new Date().toLocaleString("en-US", {timeZone: "Australia/Adelaide"});
    const hour = new Date(adelaideTime).getHours();
    return (hour >= 6 && hour < 15) ? 'morning' : 'evening';
  }, []);

  const resetMidnight = useCallback(async () => {
    try {
      // Reset local state
      setTodayStatus({
        dog: { morning: false, evening: false },
        cat: { morning: false, evening: false }
      });
      
      // Fetch fresh data from server
      await fetchFeedingData();
    } catch (error) {
      console.error('Error during midnight reset:', error);
    }
  }, [fetchFeedingData]);

  useEffect(() => {
    fetchFeedingData();
    
    // Set up interval to check for midnight reset using Adelaide time
    const checkMidnightReset = () => {
      // Use Adelaide time for midnight reset checks
      const adelaideTime = new Date().toLocaleString("en-US", {timeZone: "Australia/Adelaide"});
      const now = new Date(adelaideTime);
      const currentDate = now.toISOString().split('T')[0];
      
      // Check if we've crossed into a new day
      if (lastResetDate && currentDate !== lastResetDate) {
        resetMidnight();
      }
      
      // Also check for exact midnight in Adelaide time
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetMidnight();
      }
    };
    
    const midnightInterval = setInterval(checkMidnightReset, 60000); // Check every minute
    
    return () => {
      clearInterval(midnightInterval);
    };
  }, [lastResetDate, resetMidnight, fetchFeedingData]);

  return {
    todayStatus,
    feedingHistory,
    loading,
    updateFeedingStatus,
    getCurrentMealTime,
    fetchFeedingData,
    resetMidnight
  };
} 