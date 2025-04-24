import { INestApplication } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

export function setupLogger(app: INestApplication) {
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
}
