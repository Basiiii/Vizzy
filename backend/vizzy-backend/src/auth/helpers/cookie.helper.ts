import { AUTH_COOKIES } from '@/constants/auth.constants';
import { Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
export class CookieHelper {
  private static logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  static setAuthCookies(
    res: Response,
    accessToken?: string,
    refreshToken?: string,
  ): void {
    this.logger.info('Setting authentication cookies');
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(AUTH_COOKIES.ACCESS_TOKEN, accessToken || '', {
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    res.cookie(AUTH_COOKIES.REFRESH_TOKEN, refreshToken || '', {
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
      path: '/',
    });
  }
}
