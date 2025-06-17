import { ObjectId } from 'mongodb';
import { CalendarEvent, EventCategory } from './index';

// Database document structure for calendar events
export interface CalendarEventDocument {
  _id?: ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  addedBy: string; // Display name for legacy compatibility
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

// API request/response types
export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  addedBy: string; // Display name for legacy compatibility
  addedByUserId: string; // Clerk user ID for dynamic resolution
  customCreatorName?: string; // Custom name when creating for another person
  useCustomCreator?: boolean; // Flag to use customCreatorName instead of actual creator
  attendees?: string[];
  category: EventCategory;
  allDay: boolean;
  color: string;
}

export interface UpdateCalendarEventRequest {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  customCreatorName?: string;
  useCustomCreator?: boolean;
  attendees?: string[];
  category?: EventCategory;
  allDay?: boolean;
  color?: string;
}

export interface CalendarEventListResponse {
  success: boolean;
  data?: CalendarEvent[];
  error?: string;
}

export interface CalendarEventResponse {
  success: boolean;
  data?: CalendarEvent;
  error?: string;
}

// Convert MongoDB document to frontend CalendarEvent
export function documentToCalendarEvent(doc: CalendarEventDocument): CalendarEvent {
  return {
    id: doc._id?.toString() || '',
    title: doc.title,
    description: doc.description,
    startDate: doc.startDate,
    endDate: doc.endDate,
    location: doc.location,
    addedBy: doc.addedBy,
    addedByUserId: doc.addedByUserId,
    customCreatorName: doc.customCreatorName,
    useCustomCreator: doc.useCustomCreator,
    attendees: doc.attendees,
    category: doc.category,
    allDay: doc.allDay,
    color: doc.color,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
} 