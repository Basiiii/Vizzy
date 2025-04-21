import { type NextRequest, NextResponse } from 'next/server';
import { AUTH } from './lib/constants/auth';
import { PROTECTED_ROUTES } from './lib/constants/routes/protected-routes';
import { ROUTES } from './lib/constants/routes/routes';
import { apiRequest } from './lib/api/core/client';

export async function middleware(request: NextRequest) {
  // Skip middleware for the refresh page itself to avoid redirect loops
  if (request.nextUrl.pathname === ROUTES.REFRESH) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get(AUTH.AUTH_TOKEN)?.value;
  const refreshToken = request.cookies.get(AUTH.REFRESH_TOKEN)?.value;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  // If we have a refresh token but no auth token, redirect to refresh page
  // regardless of whether it's a protected route or not
  if (!authToken && refreshToken) {
    const redirectUrl = new URL(ROUTES.REFRESH, request.url);
    redirectUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isProtectedRoute) {
    // If no tokens at all, redirect to login
    if (!authToken) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    try {
      // Verify the token directly using the API client
      await apiRequest({
        method: 'POST',
        endpoint: 'auth/verify',
        token: authToken,
      });

      // If we get here, the token is valid
      return NextResponse.next();
    } catch (error) {
      console.error('Auth verification error:', error);

      // If we have a refresh token, try to use it instead of immediately redirecting to login
      if (refreshToken) {
        const redirectUrl = new URL(ROUTES.REFRESH, request.url);
        redirectUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Clear cookies and redirect to login
      const response = NextResponse.redirect(
        new URL(ROUTES.LOGIN, request.url),
      );

      // Delete auth cookies
      [AUTH.AUTH_TOKEN, AUTH.REFRESH_TOKEN].forEach((tokenName) =>
        response.cookies.delete(tokenName),
      );

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
