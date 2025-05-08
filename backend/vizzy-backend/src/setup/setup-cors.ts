import { INestApplication } from '@nestjs/common';

/**
 * Setup CORS configuration for the application.
 * @param {INestApplication} app - The NestJS application instance.
 */
export function setupCors(app: INestApplication) {
  // TODO: Change to allow only the frontend URL
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}
