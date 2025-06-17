import { useUser } from '@clerk/nextjs';
import { getUserDisplayName } from '../shopping/utils/getUserName';
import { useUserPreferences } from '../contexts/UserPreferencesContext';

// Hook to get the current user's display name based on preferences
export function useUserDisplayName(): string {
  const { user } = useUser();
  const { useNickname } = useUserPreferences();
  
  if (!user) {
    return 'Unknown User';
  }
  
  return getUserDisplayName(user, useNickname);
} 