import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from './logging.config';

@Module({
  imports: [WinstonModule.forRoot(winstonLoggerConfig)],
  exports: [WinstonModule],
})
export class LoggingModule {}
