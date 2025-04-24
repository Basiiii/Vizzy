import { VersioningType } from '@nestjs/common/enums';

export function setupVersioning(app) {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}
