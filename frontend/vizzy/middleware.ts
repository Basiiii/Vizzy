import { type NextRequest, NextResponse } from 'next/server';
import { AUTH } from './lib/constants/auth';
import { PROTECTED_ROUTES } from './lib/constants/routes/protected-routes';
import { ROUTES } from './lib/constants/routes/routes';
import { handleSessionVerification } from './lib/auth/handle-session-verification';

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get(AUTH.AUTH_TOKEN)?.value;
  const refreshToken = request.cookies.get(AUTH.REFRESH_TOKEN)?.value;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!authToken && refreshToken) {
    // TODO: Fazer refresh aqui 🤓☝️ (mete a func em lib/auth/refresh-token.ts) e atualizar var authToken
  }

  if (isProtectedRoute) {
    const verification = authToken
      ? await handleSessionVerification(authToken)
      : await handleSessionVerification(null);

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
