import { GlobalHttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ValidationExceptionFilter } from '@/common/filters/validation-exception.filter';
import { INestApplication } from '@nestjs/common';

/**
 * Setup global filters for the application.
 * Adds exception filters for handling errors.
 * @param {INestApplication} app - The NestJS application instance.
 */
export function setupGlobalFilters(app: INestApplication) {
  app.useGlobalFilters(
    new GlobalHttpExceptionFilter(),
    new ValidationExceptionFilter(),
  );
}
