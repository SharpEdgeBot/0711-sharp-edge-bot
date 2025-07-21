import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/chat(.*)',
  '/account(.*)',
]);

const isVipRoute = createRouteMatcher([
  '/dashboard/props(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check VIP-only routes
    if (isVipRoute(req)) {
      const metadata = (sessionClaims && typeof sessionClaims.metadata === 'object') ? sessionClaims.metadata as Record<string, unknown> : {};
      const subscriptionTier = metadata.subscriptionTier || 'free';
      if (subscriptionTier !== 'vip') {
        const upgradeUrl = new URL('/pricing', req.url);
        upgradeUrl.searchParams.set('required', 'vip');
        return NextResponse.redirect(upgradeUrl);
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
