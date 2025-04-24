import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom implementation of ThrottlerGuard for rate limiting requests
 * @extends {ThrottlerGuard}
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Custom error message displayed when rate limit is exceeded
   * @protected
   * @type {string}
   */
  protected errorMessage: string =
    'Rate limit exceeded. Please try again later.';
}
