export interface ActivityLogEntry {
  id: string;
  message: string;
  timestamp: Date;
  type: 'calendar' | 'shopping' | 'tasks' | 'family' | 'general';
  userName: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityRequest {
  message: string;
  type: ActivityLogEntry['type'];
  userName: string;
  userId: string;
}

export interface ActivityFilters {
  type?: ActivityLogEntry['type'];
  userId?: string;
  limit?: number;
  offset?: number;
} 