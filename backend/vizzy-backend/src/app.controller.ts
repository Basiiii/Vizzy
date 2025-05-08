import { Controller, Get } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  /**
   * Creates an instance of AppController.
   * @param logger - The logger instance injected from nest-winston.
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Health check endpoint.
   * Returns the status of the service.
   * @returns An object containing the status, timestamp, and service name.
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
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
