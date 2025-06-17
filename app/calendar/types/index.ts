// Types for calendar events - structured for easy MongoDB integration
export interface CalendarEvent {
  id: string; // Will be converted to MongoDB ObjectId later
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  addedBy: string; // User who created the event
  addedByUserId?: string; // Clerk user ID for dynamic name resolution
  customCreatorName?: string; // Custom name when creating for another person
  useCustomCreator?: boolean; // Flag to use customCreatorName instead of actual creator
  attendees?: string[]; // Family members attending
  category: EventCategory;
  allDay: boolean;
  color: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type EventCategory = 'birthday' | 'family' | 'work' | 'health' | 'sports' | 'social' | 'travel' | 'reminder' | 'custom' | 'none';

// API request types for future backend integration
export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees?: string[];
  category: EventCategory;
  allDay: boolean;
  color: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  attendees?: string[];
  category?: EventCategory;
  allDay?: boolean;
  color?: string;
}

// View and filter types
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';
export type DateRange = 'today' | 'tomorrow' | 'week' | 'month' | 'all';

export interface CalendarFilters {
  view: CalendarView;
  dateRange: DateRange;
  showCategories: Record<EventCategory, boolean>;
  showPeople: Record<string, boolean>;
  searchQuery: string;
}

// Calendar utility types
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface EventResponse {
  events: CalendarEvent[];
  total: number;
}

// Event color options
export const EVENT_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
] as const;

// Category definitions with colors (emojis removed)
export const EVENT_CATEGORIES: Record<EventCategory, { name: string; color: string }> = {
  birthday: { name: 'Birthday', color: '#EC4899' },
  family: { name: 'Family', color: '#10B981' },
  work: { name: 'Work', color: '#3B82F6' },
  health: { name: 'Health', color: '#EF4444' },
  sports: { name: 'Sports', color: '#F59E0B' },
  social: { name: 'Social', color: '#8B5CF6' },
  travel: { name: 'Travel', color: '#14B8A6' },
  reminder: { name: 'Reminder', color: '#F59E0B' },
  custom: { name: 'Custom', color: '#6366F1' },
  none: { name: 'None', color: '#6B7280' },
}; 