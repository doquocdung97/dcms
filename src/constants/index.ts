import { parseBoolean } from 'core/common';

export class DatabaseConfig {
  static TYPE = process.env.DB_TYPE || String();
  static PORT: number = parseInt(process.env.DB_PORT) || 3307;
  static HOST = process.env.DB_HOST || String();
  static USERNAME = process.env.DB_USERNAME || String();
  static PASSWORD = process.env.DB_PASSWORD || String();
  static DATABASENAME = process.env.DB_DATABASE_NAME || String();
  static MAIN = 'main'
  static CORE = 'core'
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
  static readonly PRODUCTION: boolean = false;
  static readonly PORT = process.env.PORT || 3000;
  static readonly CACHE_MAXAGE = 36000; // cache 10 hours
  static readonly GRAPHQL_LINK = '/graphql';
  static readonly GRAPHQL_FILE = 'src/graphql/schema.graphql';
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
