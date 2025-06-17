import { getUserDisplayName } from '../shopping/utils/getUserName';

// Simple in-memory cache for user data
// In production, this could be stored in localStorage or fetched from an API
interface UserCache {
  [userId: string]: {
    firstName?: string;
    lastName?: string;
    nickname?: string;
    fullName?: string;
    email?: string;
    lastFetched: number;
  };
}

let userCache: UserCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Store current user data in cache when they're logged in
export function cacheCurrentUser(userId: string, userData: any) {
  userCache[userId] = {
    firstName: userData.unsafeMetadata?.firstName,
    lastName: userData.unsafeMetadata?.lastName,
    nickname: userData.unsafeMetadata?.nickname,
    fullName: userData.fullName,
    email: userData.primaryEmailAddress?.emailAddress,
    lastFetched: Date.now(),
  };
}

// Get cached user data
function getCachedUser(userId: string) {
  const cached = userCache[userId];
  if (!cached) return null;
  
  // Check if cache is still valid
  if (Date.now() - cached.lastFetched > CACHE_DURATION) {
    delete userCache[userId];
    return null;
  }
  
  return cached;
}

// Create a mock user object for getUserDisplayName
function createMockUser(userData: any) {
  return {
    unsafeMetadata: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      nickname: userData.nickname,
    },
    fullName: userData.fullName,
    primaryEmailAddress: {
      emailAddress: userData.email,
    },
  } as any; // Type assertion for mock user object
}

// Resolve user ID to display name with current preferences
export function resolveUserDisplayName(userId: string, addedByFallback: string, useNickname: boolean = true): string {
  // Check cache first
  const cachedUser = getCachedUser(userId);
  
  if (cachedUser) {
    const mockUser = createMockUser(cachedUser);
    return getUserDisplayName(mockUser, useNickname);
  }
  
  // For now, fall back to the stored name
  // In production, you might want to fetch user data from an API
  return addedByFallback;
}

// Resolve user ID to display name with current preferences (async version for future API calls)
export async function resolveUserDisplayNameAsync(userId: string, addedByFallback: string, useNickname: boolean = true): Promise<string> {
  // Check cache first
  const cachedUser = getCachedUser(userId);
  
  if (cachedUser) {
    const mockUser = createMockUser(cachedUser);
    return getUserDisplayName(mockUser, useNickname);
  }
  
  // TODO: In production, fetch user data from API here
  // const userData = await fetchUserFromAPI(userId);
  // if (userData) {
  //   cacheCurrentUser(userId, userData);
  //   const mockUser = createMockUser(userData);
  //   return getUserDisplayName(mockUser, useNickname);
  // }
  
  // Fall back to stored name
  return addedByFallback;
}

// Clear cache (useful for testing or when user preferences change)
export function clearUserCache() {
  userCache = {};
}

// Get all cached user IDs (useful for bulk operations)
export function getCachedUserIds(): string[] {
  return Object.keys(userCache);
} 