import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

// Routes that require auth but are part of onboarding
const isOnboardingRoute = createRouteMatcher([
  '/account-setup'
]);

// Add this matcher for API routes
const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  
  // Handle API routes separately
  if (isApiRoute(req)) {
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }
  
  // If the route is not public and user is not authenticated
  if (!isPublicRoute(req) && !isOnboardingRoute(req) && !userId) {
    // Redirect to sign-in page
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  
  // If user is authenticated and trying to access sign-in/sign-up, redirect to home
  if (isPublicRoute(req) && userId) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Profile completion check - only for NEW users who have never set up their profile
  if (userId && !isPublicRoute(req) && !isOnboardingRoute(req)) {
    // Get profile data from session claims
    const profileComplete = (sessionClaims?.unsafe_metadata as any)?.profileComplete;
    const hasFirstName = (sessionClaims?.unsafe_metadata as any)?.firstName;
    const hasLastName = (sessionClaims?.unsafe_metadata as any)?.lastName;

    // Only redirect to account setup if this appears to be a brand new user
    // (no profile data at all, not even an incomplete profile)
    const isCompletelyNewUser = !profileComplete && !hasFirstName && !hasLastName;
    
    /* if (isCompletelyNewUser) {
      return NextResponse.redirect(new URL('/account-setup', req.url));
    } */
  }
});

export const config = {
  matcher: [
    // Protect all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};