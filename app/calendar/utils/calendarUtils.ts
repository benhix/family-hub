import { 
  format, 
  isToday, 
  isTomorrow, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth,
  isWithinInterval,
  addDays,
  addWeeks,
  addMonths,
  startOfDay,
  endOfDay,
  parseISO,
  isSameDay
} from 'date-fns';
import { CalendarEvent, CalendarDay, CalendarFilters, DateRange, EventCategory } from '../types';

// Format event time for display
export const formatEventTime = (event: CalendarEvent): string => {
  if (event.allDay) return 'All day';
  
  const startTime = format(event.startDate, 'h:mm a');
  const endTime = format(event.endDate, 'h:mm a');
  
  if (isSameDay(event.startDate, event.endDate)) {
    return `${startTime} - ${endTime}`;
  }
  
  return `${format(event.startDate, 'MMM d, h:mm a')} - ${format(event.endDate, 'MMM d, h:mm a')}`;
};

// Format event date for display
export const formatEventDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEEE, MMM d');
};

// Generate calendar grid for a given month
export const generateCalendarGrid = (date: Date, events: CalendarEvent[]): CalendarDay[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  return days.map(day => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isToday: isToday(day),
    events: getEventsForDay(day, events)
  }));
};

// Get events for a specific day
export const getEventsForDay = (date: Date, events: CalendarEvent[]): CalendarEvent[] => {
  return events.filter(event => {
    const eventStart = startOfDay(event.startDate);
    const eventEnd = endOfDay(event.endDate);
    const targetDay = startOfDay(date);
    
    return isWithinInterval(targetDay, { start: eventStart, end: eventEnd }) ||
           isSameDay(targetDay, eventStart) ||
           isSameDay(targetDay, eventEnd);
  });
};

// Filter events by search query
export const filterEventsBySearch = (events: CalendarEvent[], searchQuery: string): CalendarEvent[] => {
  if (!searchQuery.trim()) return events;
  
  const query = searchQuery.toLowerCase().trim();
  return events.filter(event => 
    event.title.toLowerCase().includes(query) ||
    event.description?.toLowerCase().includes(query) ||
    event.location?.toLowerCase().includes(query) ||
    event.addedBy.toLowerCase().includes(query) ||
    (event.customCreatorName && event.customCreatorName.toLowerCase().includes(query))
  );
};

// Filter events by date range
export const filterEventsByDateRange = (events: CalendarEvent[], dateRange: DateRange): CalendarEvent[] => {
  const now = new Date();
  
  switch (dateRange) {
    case 'today':
      return events.filter(event => 
        isWithinInterval(now, { start: startOfDay(event.startDate), end: endOfDay(event.endDate) })
      );
    
    case 'tomorrow':
      const tomorrow = addDays(now, 1);
      return events.filter(event => 
        isWithinInterval(tomorrow, { start: startOfDay(event.startDate), end: endOfDay(event.endDate) })
      );
    
    case 'week':
      const weekStart = addDays(now, -7); // Include past week
      const weekEnd = addWeeks(now, 1);
      return events.filter(event => 
        isWithinInterval(event.startDate, { start: startOfDay(weekStart), end: endOfDay(weekEnd) })
      );
    
    case 'month':
      const monthStart = addMonths(now, -1); // Include past month
      const monthEnd = addMonths(now, 1);
      return events.filter(event => 
        isWithinInterval(event.startDate, { start: startOfDay(monthStart), end: endOfDay(monthEnd) })
      );
    
    default:
      return events; // 'all' shows all events including past ones
  }
};

// Filter events by categories
export const filterEventsByCategories = (
  events: CalendarEvent[], 
  showCategories: Record<EventCategory, boolean>
): CalendarEvent[] => {
  return events.filter(event => showCategories[event.category]);
};

// Filter events by people
export const filterEventsByPeople = (
  events: CalendarEvent[], 
  showPeople: Record<string, boolean>
): CalendarEvent[] => {
  return events.filter(event => showPeople[event.addedBy] !== false);
};

// Apply all filters
export const applyCalendarFilters = (events: CalendarEvent[], filters: CalendarFilters): CalendarEvent[] => {
  let filtered = events;
  
  // Apply search filter
  filtered = filterEventsBySearch(filtered, filters.searchQuery);
  
  // Apply date range filter
  filtered = filterEventsByDateRange(filtered, filters.dateRange);
  
  // Apply category filter
  filtered = filterEventsByCategories(filtered, filters.showCategories);
  
  // Apply people filter
  filtered = filterEventsByPeople(filtered, filters.showPeople);
  
  return filtered;
};

// Get unique people from events
export const getUniquePeople = (events: CalendarEvent[]): string[] => {
  const people = Array.from(new Set(events.map(event => event.addedBy)));
  return people.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};

// Sort events by start date
export const sortEventsByDate = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

// Group events by date
export const groupEventsByDate = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
  const grouped: Record<string, CalendarEvent[]> = {};
  
  events.forEach(event => {
    const dateKey = format(event.startDate, 'yyyy-MM-dd');
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });
  
  // Sort events within each date
  Object.keys(grouped).forEach(date => {
    grouped[date] = sortEventsByDate(grouped[date]);
  });
  
  return grouped;
};

// Check if event is happening now
export const isEventHappeningNow = (event: CalendarEvent): boolean => {
  const now = new Date();
  return isWithinInterval(now, { start: event.startDate, end: event.endDate });
};

// Get event status
export const getEventStatus = (event: CalendarEvent): 'upcoming' | 'ongoing' | 'completed' => {
  const now = new Date();
  
  if (now < event.startDate) return 'upcoming';
  if (now > event.endDate) return 'completed';
  return 'ongoing';
};

// Check if event is in the past
export const isEventPast = (event: CalendarEvent): boolean => {
  const now = new Date();
  return event.endDate < now;
};

// Calculate event duration in minutes
export const getEventDuration = (event: CalendarEvent): number => {
  return Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60));
};

// Get the display name for who created the event
export const getEventCreatorDisplayName = (event: CalendarEvent): string => {
  if (event.useCustomCreator && event.customCreatorName) {
    return event.customCreatorName;
  }
  return event.addedBy;
}; 