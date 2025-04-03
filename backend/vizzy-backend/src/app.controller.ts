import { Controller, Get } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('health')
  healthCheck() {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'vizzy-backend',
    };

    this.logger.info('Health check requested', {
      status: response.status,
      timestamp: response.timestamp,
      context: AppController.name,
    });

    return response;
  }
}
