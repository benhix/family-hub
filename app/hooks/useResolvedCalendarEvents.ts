import { useMemo } from 'react';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { resolveUserDisplayName } from '../utils/userResolver';
import { CalendarEvent } from '../calendar/types';

// Hook that resolves all user names in calendar events efficiently
export function useResolvedCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
  const { useNickname } = useUserPreferences();
  
  return useMemo(() => {
    return events.map(event => ({
      ...event,
      addedBy: event.addedByUserId 
        ? resolveUserDisplayName(event.addedByUserId, event.addedBy, useNickname)
        : event.addedBy
    }));
  }, [events, useNickname]);
} 