import { createLogger, transports, format } from 'winston';
import { join } from 'path';
import { Config, LoggerConfig } from 'src/Constants';
import { TransformableInfo } from 'logform';
import { LoggerService } from '@nestjs/common';

function filenamebydate(filename: String) {
  let date = new Date();
  let newFilename = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}_${filename}`;
  return newFilename;
}
export class LoggerHelper implements LoggerService {
  private logger;
  constructor(name: string) {
    let self = this;
    let data_transports: any = [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf((log) => self.printf(log)),
        ),
      }),
    ];
    if (Config.PRODUCT) {
      data_transports.push(
        new transports.File({
          level: LoggerConfig.LEVEL_ERROR,
          filename: join(
            LoggerConfig.FOLDER,
            filenamebydate(LoggerConfig.ERROR_FILE),
          ),
        }),
        new transports.File({
          level: LoggerConfig.LEVEL_INFO,
          filename: join(
            LoggerConfig.FOLDER,
            filenamebydate(LoggerConfig.INFO_FILE),
          ),
        }),
      );
    }
    this.logger = createLogger({
      format: format.combine(
        format.splat(),
        format.timestamp({
          format: LoggerConfig.FORMAT_DATE,
        }),
        format.printf((log) => self.printf(log)),
      ),
      defaultMeta: { name },
      transports: data_transports,
    });
  }
  private printf(info: TransformableInfo) {
    let message = info.message;
    return `[${info.timestamp}] [${info.level}] [${info.name}] - ${message} ${
      info.stack || String()
    }`;
  }
  info(message: string) {
    this.logger.info(message);
  }
  warn(message: string) {
    this.logger.warn(message);
  }
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message);
  }
  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message);
  }
}
