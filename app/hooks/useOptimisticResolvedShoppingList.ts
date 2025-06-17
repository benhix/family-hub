import { useState, useCallback } from 'react';
import { ShoppingItem } from '../shopping/types';
import { CreateShoppingItemRequest } from '../shopping/types/database';
import { useShoppingOperations } from '../shopping/hooks/useShoppingApi';
import { useResolvedShoppingItems } from './useResolvedShoppingItems';

// Hook that provides optimistic updates for resolved shopping items
export function useOptimisticResolvedShoppingList(rawItems: ShoppingItem[], setRawItems: (items: ShoppingItem[]) => void) {
  const { updateItem, deleteItem, createItem } = useShoppingOperations();
  const resolvedItems = useResolvedShoppingItems(rawItems);

  const handleToggleComplete = useCallback(async (id: string) => {
    // Find the item in raw items (for API call)
    const rawItem = rawItems.find(item => item.id === id);
    if (!rawItem) return;

    // Optimistically update raw items immediately for instant UI feedback
    const optimisticRawItems = rawItems.map(item =>
      item.id === id 
        ? { ...item, completed: !item.completed, updatedAt: new Date() }
        : item
    );
    setRawItems(optimisticRawItems);

    // API call
    const updatedItem = await updateItem(id, { completed: !rawItem.completed });
    
    // Always refetch from database after API call to ensure consistency
    // This will get the latest state regardless of success/failure
    try {
      const response = await fetch('/api/shopping');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Convert string dates back to Date objects
        const itemsWithDates = result.data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
        }));
        setRawItems(itemsWithDates);
      } else {
        // If refetch fails, revert to original state
        setRawItems(rawItems);
      }
    } catch (error) {
      console.error('Error refetching shopping items:', error);
      // Revert to original state on refetch error
      setRawItems(rawItems);
    }
  }, [rawItems, setRawItems, updateItem]);

  const handleDeleteItem = useCallback(async (id: string): Promise<boolean> => {
    // Optimistically remove item for instant UI feedback
    const optimisticRawItems = rawItems.filter(item => item.id !== id);
    setRawItems(optimisticRawItems);

    const success = await deleteItem(id);
    
    // Always refetch from database after API call
    try {
      const response = await fetch('/api/shopping');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Convert string dates back to Date objects
        const itemsWithDates = result.data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
        }));
        setRawItems(itemsWithDates);
      } else {
        // If refetch fails and delete was supposed to succeed, revert to optimistic state
        // If delete failed, revert to original state
        setRawItems(success ? optimisticRawItems : rawItems);
      }
    } catch (error) {
      console.error('Error refetching shopping items:', error);
      // Revert based on delete success
      setRawItems(success ? optimisticRawItems : rawItems);
    }
    
    return success;
  }, [rawItems, setRawItems, deleteItem]);

  const handleAddItem = useCallback(async (itemName: string, category: 'Grocery' | 'F&V', addedBy: string, addedByUserId: string, notes?: string) => {
    const newItemData: CreateShoppingItemRequest = {
      item: itemName,
      category,
      addedBy,
      addedByUserId,
      notes,
    };

    const createdItem = await createItem(newItemData);
    
    // Always refetch from database after adding to ensure consistency
    try {
      const response = await fetch('/api/shopping');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Convert string dates back to Date objects
        const itemsWithDates = result.data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
        }));
        setRawItems(itemsWithDates);
      } else if (createdItem) {
        // Fallback to optimistic update if refetch fails but item was created
        setRawItems([createdItem, ...rawItems]);
      }
    } catch (error) {
      console.error('Error refetching shopping items:', error);
      if (createdItem) {
        // Fallback to optimistic update if refetch fails but item was created
        setRawItems([createdItem, ...rawItems]);
      }
    }
  }, [rawItems, setRawItems, createItem]);

  return {
    items: resolvedItems, // Return resolved items for display
    handleToggleComplete,
    handleDeleteItem,
    handleAddItem,
  };
} 