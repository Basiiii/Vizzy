import { VersioningType } from '@nestjs/common/enums';
import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';

/**
 * Setup API versioning for the application.
 * Configures URI-based versioning.
 * @param {INestApplication} app - The NestJS application instance.
 */
export function setupVersioning(app: INestApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}
