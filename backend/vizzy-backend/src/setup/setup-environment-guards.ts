import { CustomThrottlerGuard } from '@/common/guards/throttler.guard';
import { INestApplication } from '@nestjs/common';

/**
 * Setup environment-specific guards for the application.
 * Applies rate limiting in production environments.
 * @param {INestApplication} app - The NestJS application instance.
 */
export function setupEnvironmentSpecificGuards(app: INestApplication) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.useGlobalGuards(app.get(CustomThrottlerGuard));
    console.log(
      'Production environment detected: Applying global rate limiter.',
    );
  } else {
    console.log(
      `Non-production environment detected (${process.env.NODE_ENV}): Skipping global rate limiter.`,
    );
  }
}
