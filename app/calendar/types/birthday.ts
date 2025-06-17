// Birthday types for calendar integration
export interface Birthday {
  id: string;
  name: string;
  birthDate: Date; // Month and day only (year will be current year for display)
  originalYear?: number; // Optional: birth year for age calculation
  notes?: string;
  reminderDays?: number; // How many days before to remind
  createdAt: Date;
  updatedAt?: Date;
  addedBy: string;
  addedByUserId?: string;
}

// API request types
export interface CreateBirthdayRequest {
  name: string;
  birthDate: Date;
  originalYear?: number;
  notes?: string;
  reminderDays?: number;
  addedBy: string;
  addedByUserId: string;
}

export interface UpdateBirthdayRequest {
  name?: string;
  birthDate?: Date;
  originalYear?: number;
  notes?: string;
  reminderDays?: number;
}

// Response types
export interface BirthdayListResponse {
  success: boolean;
  data?: Birthday[];
  error?: string;
}

export interface BirthdayResponse {
  success: boolean;
  data?: Birthday;
  error?: string;
}

// Birthday search filters
export interface BirthdayFilters {
  searchQuery: string;
  month?: number; // 1-12 for month filter
  sortBy: 'name' | 'date' | 'age';
  sortOrder: 'asc' | 'desc';
}

// Utility function to convert birthday to calendar event for display
export function birthdayToCalendarEvent(birthday: Birthday, year?: number): import('./index').CalendarEvent {
  const currentYear = new Date().getFullYear();
  const today = new Date();
  
  // If no year specified, determine the next occurrence
  let targetYear = year || currentYear;
  let eventDate = new Date(targetYear, birthday.birthDate.getMonth(), birthday.birthDate.getDate());
  
  // If the birthday has already passed this year, use next year
  if (!year && eventDate < today) {
    targetYear = currentYear + 1;
    eventDate = new Date(targetYear, birthday.birthDate.getMonth(), birthday.birthDate.getDate());
  }
  
  // Calculate age - if originalYear is null, extract it from the birthDate
  let age: number | undefined;
  if (birthday.originalYear) {
    age = targetYear - birthday.originalYear;
  } else {
    // Extract year from birthDate if originalYear is null/undefined
    const birthYear = birthday.birthDate.getFullYear();
    if (birthYear && birthYear > 1900 && birthYear <= currentYear) {
      age = targetYear - birthYear;
    }
  }
  
  return {
    id: `birthday-${birthday.id}`,
    title: birthday.name,
    description: birthday.notes || `Birthday celebration for ${birthday.name}`,
    startDate: eventDate,
    endDate: eventDate,
    location: undefined,
    addedBy: birthday.addedBy,
    addedByUserId: birthday.addedByUserId,
    attendees: [],
    category: 'birthday',
    allDay: true,
    color: '#EC4899', // Pink color for birthdays
    createdAt: birthday.createdAt,
    updatedAt: birthday.updatedAt,
    // Add age property for birthday events
    _age: age,
  } as import('./index').CalendarEvent & { _age?: number };
} 