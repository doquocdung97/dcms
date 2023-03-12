

export * from './common';
export * from './models/Media';
export * from './models/ObjectBase';
export * from './models/ObjectMain';
export * from './models/User';
export * from './models/Document';
export * from './models/Authentication';
export * from './models/ValueMedia';
export * from './models/ValueObject';
export * from './models/Property';
export * from './models/Token';
export * from './subscriber/PropertySubscriber';

import { Token } from 'graphql';
import { Authentication } from './models/Authentication';
import { AuthContentDocument, BaseDocument } from './models/Document';
import { BaseMedia } from './models/Media';
import { ObjectBase } from './models/ObjectBase';
import { ObjectMain } from './models/ObjectMain';
import { PropertyBase } from './models/Property';
import { User } from './models/User';
import { ValueMedia } from './models/ValueMedia';
import { ValueObject } from './models/ValueObject';

export const Models = [
	ObjectBase,
	ObjectMain,
	PropertyBase,
	ValueObject,
	ValueMedia,
	BaseMedia,
	User,
	BaseDocument,
	AuthContentDocument,
	Authentication,
	Token
]
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { DatabaseConfig } from 'src/constants';
import { LoggerHelper } from '../common';
import { PropertySubscriber } from './subscriber/PropertySubscriber';

const AppDataSource = new DataSource({
	type: 'mysql',
	host: DatabaseConfig.HOST,
	port: DatabaseConfig.PORT,
	username: DatabaseConfig.USERNAME,
	password: DatabaseConfig.PASSWORD,
	database: DatabaseConfig.DATABASENAME,
	synchronize: true,
	//logging: true,
	entities: Models,//['src/core/database/models/**/*.ts'],
	subscribers: [PropertySubscriber],//['subscriber/**/*.ts'],
	migrations: [],
});

export class DataBase {
	private _logger = new LoggerHelper('Database');
	private static instance: DataBase;
	private _datasource: DataSource;
	private _datasources = {};
	constructor() {
		const instance = DataBase.instance;
		if (instance) {
			return instance;
		}
		DataBase.instance = this;
	}
	async connect() {
		if (!this._datasource) {
			this._logger.info('connecting')
			await AppDataSource.initialize()
				.then(async (data) => {
					this._logger.info('connected')
					this._datasource = data
					return data
				})
				.catch(error => {
					this._logger.error(error)
					// throw new Error("can't connect to database")
				});
		}

		return this._datasource
	}
	async createDataSource(name: string) {
		let datasource = await this.connect()
		this._datasources[name] = datasource
	}
	getDataSource(name: string): DataSource | null {
		return this._datasources[name]
	}
}