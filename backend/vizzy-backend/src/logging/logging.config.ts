import * as winston from 'winston';

export const winstonLoggerConfig = winston.createLogger({
  level: 'info', // Minimum log level
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Format timestamp
    winston.format.colorize(), // Adds color output
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
  transports: [
    new winston.transports.Console(), // Logs to console only
  ],
});
