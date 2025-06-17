import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '../types';
import { CreateCalendarEventRequest, UpdateCalendarEventRequest } from '../types/database';

// Hook for fetching calendar events
export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/calendar');
      const result = await response.json();
      
      if (result.success) {
        // Convert string dates back to Date objects
        const eventsWithDates = result.data.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          createdAt: new Date(event.createdAt),
          updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
        }));
        setEvents(eventsWithDates);
      } else {
        setError(result.error || 'Failed to fetch events');
      }
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, setEvents, loading, error, refetch: fetchEvents };
}

// Hook for calendar operations (create, update, delete)
export function useCalendarOperations() {
  const createEvent = useCallback(async (eventData: CreateCalendarEventRequest): Promise<CalendarEvent | null> => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Convert string dates back to Date objects
        return {
          ...result.data,
          startDate: new Date(result.data.startDate),
          endDate: new Date(result.data.endDate),
          createdAt: new Date(result.data.createdAt),
          updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt) : undefined,
        };
      } else {
        console.error('Failed to create event:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, updates: UpdateCalendarEventRequest): Promise<CalendarEvent | null> => {
    try {
      const response = await fetch(`/api/calendar/${id}`, {
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
          startDate: new Date(result.data.startDate),
          endDate: new Date(result.data.endDate),
          createdAt: new Date(result.data.createdAt),
          updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt) : undefined,
        };
      } else {
        console.error('Failed to update event:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/calendar/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        console.error('Failed to delete event:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }, []);

  return { createEvent, updateEvent, deleteEvent };
} 