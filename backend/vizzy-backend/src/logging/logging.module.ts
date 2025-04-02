import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from './logging.config';

@Global()
@Module({
  imports: [WinstonModule.forRoot(winstonLoggerConfig)],
  exports: [WinstonModule],
})
export class LoggingModule {}
