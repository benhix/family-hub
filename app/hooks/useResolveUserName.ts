import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { resolveUserDisplayName } from '../utils/userResolver';

// Hook to resolve a single user name
export function useResolveUserName(userId: string | undefined, fallbackName: string): string {
  const { useNickname } = useUserPreferences();
  
  if (!userId) {
    return fallbackName;
  }
  
  return resolveUserDisplayName(userId, fallbackName, useNickname);
}

// Hook to resolve multiple user names (for lists)
export function useResolveUserNames(items: Array<{ addedByUserId?: string; addedBy: string }>): Array<string> {
  const { useNickname } = useUserPreferences();
  
  return items.map(item => {
    if (!item.addedByUserId) {
      return item.addedBy;
    }
    return resolveUserDisplayName(item.addedByUserId, item.addedBy, useNickname);
  });
} 