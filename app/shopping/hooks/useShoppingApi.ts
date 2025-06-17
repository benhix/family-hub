import { useState, useEffect } from 'react';
import { ShoppingItem } from '../types';
import { CreateShoppingItemRequest, UpdateShoppingItemRequest } from '../types/database';

// Custom hook for fetching shopping items
export function useShoppingItems() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/shopping');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch items');
      }
      
      // Convert string dates back to Date objects
      const itemsWithDates = (result.data || []).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
      }));
      
      setItems(itemsWithDates);
    } catch (err) {
      console.error('Error fetching shopping items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, loading, error, refetch: fetchItems, setItems };
}

// Custom hook for shopping item operations
export function useShoppingOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (itemData: CreateShoppingItemRequest): Promise<ShoppingItem | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/shopping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create item');
      }

      // Convert string dates back to Date objects
      const itemWithDates = {
        ...result.data,
        createdAt: new Date(result.data.createdAt),
        updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt) : undefined,
        completedAt: result.data.completedAt ? new Date(result.data.completedAt) : undefined,
      };

      return itemWithDates;
    } catch (err) {
      console.error('Error creating shopping item:', err);
      setError(err instanceof Error ? err.message : 'Failed to create item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, updates: UpdateShoppingItemRequest): Promise<ShoppingItem | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/shopping/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update item');
      }

      // Convert string dates back to Date objects
      const itemWithDates = {
        ...result.data,
        createdAt: new Date(result.data.createdAt),
        updatedAt: result.data.updatedAt ? new Date(result.data.updatedAt) : undefined,
        completedAt: result.data.completedAt ? new Date(result.data.completedAt) : undefined,
      };

      return itemWithDates;
    } catch (err) {
      console.error('Error updating shopping item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/shopping/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete item');
      }

      return true;
    } catch (err) {
      console.error('Error deleting shopping item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createItem,
    updateItem,
    deleteItem,
    loading,
    error,
  };
}

// Optimistic updates helper hook
export function useOptimisticShoppingList(items: ShoppingItem[], setItems: (items: ShoppingItem[]) => void) {
  const { createItem, updateItem, deleteItem } = useShoppingOperations();

  const handleToggleComplete = async (id: string) => {
    // Find the item to update
    const item = items.find(item => item.id === id);
    if (!item) return;

    // Optimistic update
    const optimisticItems = items.map(item =>
      item.id === id 
        ? { ...item, completed: !item.completed, updatedAt: new Date() }
        : item
    );
    setItems(optimisticItems);

    // API call
    const updatedItem = await updateItem(id, { completed: !item.completed });
    
    if (!updatedItem) {
      // Revert on failure
      setItems(items);
    } else {
      // Update with server response (dates are already converted in updateItem)
      setItems(items.map(item => item.id === id ? updatedItem : item));
    }
  };

  // Updated to return item info for confirmation modal
  const handleDeleteItem = async (id: string) => {
    const success = await deleteItem(id);
    
    if (success) {
      setItems(items.filter(item => item.id !== id));
      return true;
    }
    return false;
  };

  const handleAddItem = async (itemName: string, category: 'Grocery' | 'F&V', addedBy: string, addedByUserId: string) => {
    const newItemData: CreateShoppingItemRequest = {
      item: itemName,
      category,
      addedBy,
      addedByUserId,
    };

    const createdItem = await createItem(newItemData);
    
    if (createdItem) {
      setItems([createdItem, ...items]);
    }
  };

  return {
    handleToggleComplete,
    handleDeleteItem,
    handleAddItem,
  };
} 