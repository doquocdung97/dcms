export * from './models/Media';
export * from './models/ObjectBase';
export * from './models/Property';
export * from './models/User';
export * from './models/ValueMedia';
export * from './models/ValueObject';
export * from './models/History';
//import { DataSource } from 'typeorm';
//import { Config } from '../Constants';
//export const AppDataSource = new DataSource({
//  type: 'mysql',
//  host: Config.DATABASE.HOST,
//  port: Config.DATABASE.PORT,
//  username: Config.DATABASE.USERNAME,
//  password: Config.DATABASE.PASSWORD,
//  database: Config.DATABASE.DATABASENAME,
//  synchronize: true,
//  logging: true,
//  entities: ['./models/**/*.ts'],
//  subscribers: [],
//  migrations: [],
//});
//AppDataSource.initialize()
//  .then(data => {
//    // here you can start to work with your database
//    console.log(data);
//  })
//  .catch(error => console.error(error));
