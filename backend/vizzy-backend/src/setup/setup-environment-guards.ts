import { CustomThrottlerGuard } from '@/common/guards/throttler.guard';

export function setupEnvironmentSpecificGuards(app) {
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
