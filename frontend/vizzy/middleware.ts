import { type NextRequest, NextResponse } from 'next/server';
import { AUTH } from './lib/constants/auth';
import { PROTECTED_ROUTES } from './lib/constants/routes/protected-routes';
import { ROUTES } from './lib/constants/routes/routes';
import { SessionService } from './lib/api/auth/session/session-service';
import { refreshSession } from './lib/api/auth/session/refresh-session';
export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get(AUTH.AUTH_TOKEN)?.value;
  const refreshToken = request.cookies.get(AUTH.REFRESH_TOKEN)?.value;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!authToken && refreshToken) {
    try {
      await refreshSession(refreshToken);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }

  if (isProtectedRoute) {
    if (!authToken) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    const verification = await SessionService.verifySession(authToken);

    // API connection error
    if (verification.valid === 'UNKNOWN') {
      const response = NextResponse.redirect(
        new URL(ROUTES.LOGIN, request.url),
      );
      [AUTH.AUTH_TOKEN, AUTH.REFRESH_TOKEN].forEach((tokenName) =>
        response.cookies.delete(tokenName),
      );

      return response;
    }

    // Valid auth
    if (verification.valid === true) {
      return NextResponse.next();
    }

    // Invalid auth
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
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
