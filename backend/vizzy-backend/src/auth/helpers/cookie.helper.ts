import { AUTH_COOKIES } from '@/constants/auth.constants';
import { Response, CookieOptions } from 'express';

export class CookieHelper {
  static setAuthCookies(
    res: Response,
    accessToken?: string,
    refreshToken?: string,
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';

    const baseCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };

    res.cookie(AUTH_COOKIES.ACCESS_TOKEN, accessToken || '', {
      ...baseCookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie(AUTH_COOKIES.REFRESH_TOKEN, refreshToken || '', {
      ...baseCookieOptions,
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    });
  }
}
