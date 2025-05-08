import { INestApplication } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

/**
 * Setup logger for the application.
 * Configures the logging provider.
 * @param {INestApplication} app - The NestJS application instance.
 */
export function setupLogger(app: INestApplication) {
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
}
