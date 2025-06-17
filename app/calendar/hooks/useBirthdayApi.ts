import { useState, useEffect, useCallback } from 'react';
import { Birthday, CreateBirthdayRequest, UpdateBirthdayRequest } from '../types/birthday';

// Hook for fetching birthdays
export function useBirthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBirthdays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/birthdays');
      const result = await response.json();
      
      if (result.success) {
        // Convert string dates back to Date objects
        const birthdaysWithDates = result.data.map((birthday: any) => ({
          ...birthday,
          birthDate: new Date(birthday.birthDate),
          createdAt: new Date(birthday.createdAt),
          updatedAt: birthday.updatedAt ? new Date(birthday.updatedAt) : undefined,
        }));
        setBirthdays(birthdaysWithDates);
      } else {
        setError(result.error || 'Failed to fetch birthdays');
      }
    } catch (err) {
      setError('Failed to fetch birthdays');
      console.error('Error fetching birthdays:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBirthdays();
  }, [fetchBirthdays]);

  return { birthdays, setBirthdays, loading, error, refetch: fetchBirthdays };
}

// Hook for birthday operations (create, update, delete)
export function useBirthdayOperations() {
  const checkDuplicateName = useCallback(async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/birthdays/check-duplicate?name=${encodeURIComponent(name)}${excludeId ? `&excludeId=${excludeId}` : ''}`);
      const result = await response.json();
      return result.exists || false;
    } catch (error) {
      console.error('Error checking duplicate name:', error);
      return false;
    }
  }, []);

  const createBirthday = useCallback(async (birthdayData: CreateBirthdayRequest): Promise<Birthday | null> => {
    try {
      // Check for duplicate name first
      const isDuplicate = await checkDuplicateName(birthdayData.name);
      if (isDuplicate) {
        throw new Error(`A birthday for "${birthdayData.name}" already exists`);
      }

      const response = await fetch('/api/birthdays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(birthdayData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Convert string dates back to Date objects
        return {
          ...result.data,
          birthDate: new Date(result.data.birthDate),
          createdAt: new Date(result.data.createdAt),
          updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt) : undefined,
        };
      } else {
        console.error('Failed to create birthday:', result.error);
        throw new Error(result.error || 'Failed to create birthday');
      }
    } catch (error) {
      console.error('Error creating birthday:', error);
      throw error;
    }
  }, [checkDuplicateName]);

  const updateBirthday = useCallback(async (id: string, updates: UpdateBirthdayRequest): Promise<Birthday | null> => {
    try {
      // Check for duplicate name if name is being updated
      if (updates.name) {
        const isDuplicate = await checkDuplicateName(updates.name, id);
        if (isDuplicate) {
          throw new Error(`A birthday for "${updates.name}" already exists`);
        }
      }

      const response = await fetch(`/api/birthdays/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      
      if (result.success) {
        // Convert string dates back to Date objects
        return {
          ...result.data,
          birthDate: new Date(result.data.birthDate),
          createdAt: new Date(result.data.createdAt),
          updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt) : undefined,
        };
      } else {
        console.error('Failed to update birthday:', result.error);
        throw new Error(result.error || 'Failed to update birthday');
      }
    } catch (error) {
      console.error('Error updating birthday:', error);
      throw error;
    }
  }, [checkDuplicateName]);

  const deleteBirthday = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/birthdays/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Failed to delete birthday:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting birthday:', error);
      return false;
    }
  }, []);

  return { createBirthday, updateBirthday, deleteBirthday, checkDuplicateName };
} 