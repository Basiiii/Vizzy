import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupCors } from './setup/setup-cors';
import { setupEnvironmentSpecificGuards } from './setup/setup-environment-guards';
import { setupGlobalFilters } from './setup/setup-global-filters';
import { setupGlobalPipes } from './setup/setup-global-pipes';
import { setupLogger } from './setup/setup-logger';
import { setupSwagger } from './setup/setup-swagger-docs';
import { setupVersioning } from './setup/setup-versioning';

/**
 * Bootstrap the NestJS application.
 * Sets up various configurations and starts the server.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupLogger(app);
  setupVersioning(app);
  setupGlobalFilters(app);
  setupGlobalPipes(app);
  setupSwagger(app);
  setupCors(app);
  setupEnvironmentSpecificGuards(app);

  await app.listen(process.env.PORT ?? 5000);
}

void bootstrap();
