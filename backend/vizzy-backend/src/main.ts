import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import * as cookieParser from 'cookie-parser';
import { VersioningType } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalFilters(
    new GlobalHttpExceptionFilter(),
    new ValidationExceptionFilter(),
  );

  app.useGlobalPipes(new ZodValidationPipe());

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Vizzy API')
    .setDescription('The Vizzy API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const allowedOrigins = [
    'https://vizzy-six.vercel.app',
    'https://vizzy-basis-projects.vercel.app',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  // Add additional development origins in non-production
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }

  app.enableCors({
    origin: (
      origin: string,
      callback: (error: Error, allow: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.useGlobalGuards(app.get(CustomThrottlerGuard));

  await app.listen(process.env.PORT ?? 5000);
}

void bootstrap();
