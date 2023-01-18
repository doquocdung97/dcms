import { createLogger, transports, format } from 'winston';
import { join } from 'path';
export class LoggerHelper {
  private logger;
  constructor(name: string) {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.splat(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.colorize(),
        format.printf((log) => {
          var message = log.message;
          if (log.stack) {
            message = log.stack;
          }
          return `[${log.timestamp}] [${log.level}] [${log.name}] - ${message}`;
        }),
      ),
      defaultMeta: { service: 'user-service', name },
      transports: [
        new transports.Console(),
        new transports.File({
          level: 'error',
          filename: join(__dirname, 'errors.log'),
        }),
        new transports.File({ filename: 'combined.log' }),
      ],
    });
  }
  info(message: string) {
    this.logger.info(message);
  }
  warn(message: string) {
    this.logger.warn(message);
  }
  error(message: string) {
    this.logger.error(message);
  }
}
