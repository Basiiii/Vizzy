import * as winston from 'winston';

export const winstonLoggerConfig = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf((info) => {
      const timestamp =
        typeof info.timestamp === 'string'
          ? info.timestamp
          : JSON.stringify(info.timestamp);
      const level =
        typeof info.level === 'string'
          ? info.level
          : JSON.stringify(info.level);
      const message =
        typeof info.message === 'string'
          ? info.message
          : JSON.stringify(info.message);

      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
};
