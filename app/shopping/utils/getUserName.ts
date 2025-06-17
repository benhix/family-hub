import { UserResource } from '@clerk/types';

// Utility function to get user's display name from Clerk
export const getUserDisplayName = (user: UserResource | null | undefined, useNickname: boolean = true): string => {
  if (!user) return 'Anonymous';
  
  const firstName = user.unsafeMetadata?.firstName as string;
  const nickname = user.unsafeMetadata?.nickname as string;
  
  // If using nicknames and user has a nickname, use it
  if (useNickname && nickname) return nickname;
  
  // Otherwise use first name
  if (firstName) return firstName;
  
  // Fallback to full name if no first name
  if (user.fullName) return user.fullName;
  
  // Final fallback to email username
  if (user.primaryEmailAddress?.emailAddress) {
    return user.primaryEmailAddress.emailAddress.split('@')[0];
  }
  
  return 'Anonymous';
}; 