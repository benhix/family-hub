import { useMemo } from 'react';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { resolveUserDisplayName } from '../utils/userResolver';
import { ShoppingItem } from '../shopping/types';

// Hook that resolves all user names in a shopping list efficiently
export function useResolvedShoppingItems(items: ShoppingItem[]): ShoppingItem[] {
  const { useNickname } = useUserPreferences();
  
  return useMemo(() => {
    return items.map(item => ({
      ...item,
      addedBy: item.addedByUserId 
        ? resolveUserDisplayName(item.addedByUserId, item.addedBy, useNickname)
        : item.addedBy
    }));
  }, [items, useNickname]);
} 