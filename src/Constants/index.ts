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
  static DATABASE = Database;
}
