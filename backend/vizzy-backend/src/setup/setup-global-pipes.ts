import { ZodValidationPipe } from 'nestjs-zod';

export function setupGlobalPipes(app) {
  app.useGlobalPipes(new ZodValidationPipe());
}
