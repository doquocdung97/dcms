export class DatabaseConfig {
  static TYPE = process.env.TYPE || String();
  static PORT: number = parseInt(process.env.PORT) || 3307;
  static HOST = process.env.HOST || String();
  static USERNAME = process.env.USERNAME || String();
  static PASSWORD = process.env.PASSWORD || String();
  static DATABASENAME = process.env.DATABASENAME || String();
}
export class PasswordConfig {
  static readonly ROUNDS = 10;
  static readonly AUTH_SECRET_KEY = 'secretKey';
}
export class MediaConfig {
  static readonly FORDER_FILE = 'media';
  static readonly FORDER_FILE_PUBLIC = '/public';
  static readonly FORDER_FILE_PRIVATE = '/private';
  static readonly FORDER_FILE_PUBLIC_ROOT = 'media/public';
}
export class Config {
  static readonly PRODUCT = false;
  static readonly PORT = process.env.port || 3000;
  static readonly CACHE_MAXAGE = 36000; // cache 10 hours
}
export class LoggerConfig {
  static readonly FOLDER = 'logs';
  static readonly ERROR_FILE = 'error.log';
  static readonly INFO_FILE = 'info.log';
  static readonly FORMAT_DATE = 'YYYY-MM-DD HH:mm:ss';
  static readonly LEVEL_ERROR = 'error';
  static readonly LEVEL_INFO = 'info';
  static readonly LEVEL_WARNING = 'warn';
}
