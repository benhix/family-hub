// Types for shopping list items - structured for easy MongoDB integration
export interface ShoppingItem {
  id: string; // Will be converted to MongoDB ObjectId later
  item: string;
  completed: boolean;
  addedBy: string; // Legacy field for display
  addedByUserId?: string; // Clerk user ID for dynamic name resolution
  category: 'Grocery' | 'F&V';
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date; // When the item was marked as completed
  // Optional fields for future enhancements
  priority?: 'low' | 'medium' | 'high';
  quantity?: number;
  notes?: string;
}

// API response types for future backend integration
export interface CreateItemRequest {
  item: string;
  category: 'Grocery' | 'F&V';
  addedBy: string;
}

export interface UpdateItemRequest {
  completed?: boolean;
  item?: string;
  category?: 'Grocery' | 'F&V';
}

export interface ShoppingListResponse {
  items: ShoppingItem[];
  total: number;
}

// Filtering and sorting types
export type SortOption = 'name-asc' | 'name-desc' | 'newest' | 'oldest';
export type ViewMode = 'combined' | 'separated' | 'grouped-by-person';

export interface FilterState {
  sortBy: SortOption;
  viewMode: ViewMode;
  searchQuery: string;
  showCategories: {
    grocery: boolean;
    fv: boolean;
  };
  showPeople: Record<string, boolean>; // personName -> show/hide
}

export interface GroupedItems {
  [personName: string]: ShoppingItem[];
} 