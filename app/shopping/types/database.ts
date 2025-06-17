import { ObjectId } from 'mongodb';
import { ShoppingItem } from './index';

// Database document structure
export interface ShoppingItemDocument {
  _id?: ObjectId;
  item: string;
  completed: boolean;
  addedBy: string; // Store user ID instead of name for dynamic resolution
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

// API request/response types
export interface CreateShoppingItemRequest {
  item: string;
  category: 'Grocery' | 'F&V';
  addedBy: string; // Display name for legacy compatibility
  addedByUserId: string; // Clerk user ID for dynamic resolution
  priority?: 'low' | 'medium' | 'high';
  quantity?: number;
  notes?: string;
}

export interface UpdateShoppingItemRequest {
  item?: string;
  completed?: boolean;
  category?: 'Grocery' | 'F&V';
  priority?: 'low' | 'medium' | 'high';
  quantity?: number;
  notes?: string;
}

export interface ShoppingListResponse {
  success: boolean;
  data?: ShoppingItem[];
  error?: string;
}

export interface ShoppingItemResponse {
  success: boolean;
  data?: ShoppingItem;
  error?: string;
}

// Convert MongoDB document to frontend ShoppingItem
export function documentToShoppingItem(doc: ShoppingItemDocument): ShoppingItem {
  return {
    id: doc._id?.toString() || '',
    item: doc.item,
    completed: doc.completed,
    addedBy: doc.addedBy,
    addedByUserId: doc.addedByUserId,
    category: doc.category,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    completedAt: doc.completedAt,
    priority: doc.priority,
    quantity: doc.quantity,
    notes: doc.notes,
  };
} 