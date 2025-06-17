import { ObjectId } from 'mongodb';

// Frontend user preferences interface
export interface UserPreferences {
  useNickname: boolean;
  compactMode?: boolean;
  showCompletedItems?: boolean;
  shoppingReminders?: boolean;
  calendarNotifications?: boolean;
  backgroundStyle?: string;
  lastTimeLogCleared?: Date;
  shoppingWidgetDate?: Date;
}

// Database document structure for user preferences
export interface UserPreferencesDocument {
  _id?: ObjectId;
  userId: string; // Clerk user ID
  useNickname: boolean;
  compactMode?: boolean;
  showCompletedItems?: boolean;
  shoppingReminders?: boolean;
  calendarNotifications?: boolean;
  backgroundStyle?: string;
  lastTimeLogCleared?: Date;
  shoppingWidgetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API request types
export interface CreateUserPreferencesRequest {
  userId: string;
  useNickname: boolean;
  compactMode?: boolean;
  showCompletedItems?: boolean;
  shoppingReminders?: boolean;
  calendarNotifications?: boolean;
  backgroundStyle?: string;
}

export interface UpdateUserPreferencesRequest {
  useNickname?: boolean;
  compactMode?: boolean;
  showCompletedItems?: boolean;
  shoppingReminders?: boolean;
  calendarNotifications?: boolean;
  backgroundStyle?: string;
  lastTimeLogCleared?: Date;
  shoppingWidgetDate?: Date;
}

export interface UserPreferencesResponse {
  success: boolean;
  data?: UserPreferences;
  error?: string;
}

// Convert MongoDB document to frontend UserPreferences
export function documentToUserPreferences(doc: UserPreferencesDocument): UserPreferences {
  return {
    useNickname: doc.useNickname,
    compactMode: doc.compactMode,
    showCompletedItems: doc.showCompletedItems,
    shoppingReminders: doc.shoppingReminders,
    calendarNotifications: doc.calendarNotifications,
    backgroundStyle: doc.backgroundStyle,
    lastTimeLogCleared: doc.lastTimeLogCleared,
    shoppingWidgetDate: doc.shoppingWidgetDate,
  };
}

// Default preferences for new users
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  useNickname: true,
  compactMode: false,
  showCompletedItems: true,
  shoppingReminders: true,
  calendarNotifications: false,
  backgroundStyle: 'default',
}; 