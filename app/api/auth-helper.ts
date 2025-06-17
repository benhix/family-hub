import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Authentication helper for API routes
 * Returns userId if authenticated, or an error response if not
 */
export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    return { userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication failed' 
      },
      { status: 401 }
    );
  }
}

/**
 * Check if the response is an error response
 */
export function isErrorResponse(result: any): result is NextResponse {
  return result instanceof NextResponse;
} 