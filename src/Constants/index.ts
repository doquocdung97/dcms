class Database {
  static TYPE = process.env.TYPE || String();
  static PORT: number = parseInt(process.env.PORT) || 3307;
  static HOST = process.env.HOST || String();
  static USERNAME = process.env.USERNAME || String();
  static PASSWORD = process.env.PASSWORD || String();
  static DATABASENAME = process.env.DATABASENAME || String();
}
export class Config {
  static PORT = process.env.port || 3000;
  static FORDER_FILE = 'media';
  static LOGGER_NEST = false;
  static FORDER_FILE_PUBLIC_ROOT = 'media/public';
  static FORDER_FILE_PUBLIC = '/public';
  static FORDER_FILE_PRIVATE = '/private';
  static CACHE_MAXAGE = 36000; // cache 10 hours
  static PASSWORD_ROUNDS = 10;
  static AUTH_SECRET_KEY = 'secretKey';
  static DATABASE = Database;
}
