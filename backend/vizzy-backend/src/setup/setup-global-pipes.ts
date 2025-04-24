import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

/**
 * Setup global pipes for the application.
 * Adds validation pipes for request data.
 * @param {INestApplication} app - The NestJS application instance.
 */
export function setupGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(new ZodValidationPipe());
}
