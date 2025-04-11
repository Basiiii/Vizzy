import { AUTH_COOKIES } from '@/constants/auth.constants';
import { Response } from 'express';

export class CookieHelper {
  static setAuthCookies(
    res: Response,
    accessToken?: string,
    refreshToken?: string,
  ): void {
    // TODO: confirm if we really need this
    // const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(AUTH_COOKIES.ACCESS_TOKEN, accessToken || '', {
      secure: true,
      sameSite: 'none',
      // httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    res.cookie(AUTH_COOKIES.REFRESH_TOKEN, refreshToken || '', {
      secure: true,
      sameSite: 'none',
      // httpOnly: true,
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
      path: '/',
    });
  }
}
