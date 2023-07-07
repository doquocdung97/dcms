import { createLogger, transports, format, Logger } from 'winston';
import { join } from 'path';
import { Variable } from "../constants";
import { TransformableInfo } from 'logform';

function filenamebydate(filename: String) {
  let date = new Date();
  let newFilename = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}_${filename}`;
  return newFilename;
}
export class LoggerHelper {
  private logger:Logger;
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
    if (true) {
      data_transports.push(
        new transports.File({
          level: Variable.LEVEL_ERROR,
          filename: join(
            Variable.FOLDER,
            filenamebydate(Variable.ERROR_FILE),
          ),
        }),
        new transports.File({
          level: Variable.LEVEL_INFO,
          filename: join(
            Variable.FOLDER,
            filenamebydate(Variable.INFO_FILE),
          ),
        }),
      );
    }
    this.logger = createLogger({
      format: format.combine(
        format.splat(),
        format.timestamp({
          format: Variable.FORMAT_DATE,
        }),
        format.printf((log) => self.printf(log)),
      ),
      defaultMeta: { name },
      transports: data_transports,
    });
  }
  private printf(info: TransformableInfo) {
    let message = info.message;
    message =  `[${info.timestamp}] [${info.level}] [${info.name}] - ${message} ${
      info.stack || String()
    }`;
    return message
  }
  info(message: string) {
    this.logger.info(message);
  }
  warn(message: string) {
    this.logger.warn(message);
  }
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(`${message}\n ${optionalParams}`);
  }
  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message);
  }
}
