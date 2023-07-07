import { ValueStandard } from './models/ValueStandard';
import { BaseResultCode, TypeProperty } from './common'
//import { Authentication } from './models/Authentication';
import { AuthContentDocument, BaseDocument } from './models/Document';
import { BaseMedia } from './models/Media';
import { ObjectBase } from './models/ObjectBase';
import { ObjectMain } from './models/ObjectMain';
import { PropertyBase } from './models/Property';
import { User } from './models/User';
import { ValueMedia } from './models/ValueMedia';
import { ValueObject } from './models/ValueObject';
export const Models = [
	// MainProperty,
	ObjectBase,
	ObjectMain,
	PropertyBase,
	ValueStandard,
	ValueMedia,
	ValueObject,
	BaseMedia,
	User,
	BaseDocument,
	AuthContentDocument
	// Authentication
]
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
// import { DatabaseConfig } from 'src/constants';
import { DirRoot, LoggerHelper } from '../common';
import { PropertySubscriber } from './subscriber/PropertySubscriber';
import { join } from 'path';
// import { readFileSync } from 'fs';
import { Config } from '../config';
import { Variable } from '../constants';


export class DataBase {
	private _logger = new LoggerHelper('Database');
	private static instance: DataBase;
	private _datasources = {};
	constructor() {
		const instance = DataBase.instance;
		if (instance) {
			return instance;
		}
		DataBase.instance = this;
	}
	async connect() {
		this._logger.info('connecting')
		// let fullname = join(DirRoot, 'config.json')
		// let rawdata = readFileSync(fullname);
		// let config = JSON.parse(rawdata.toString());
		let AppDataSource: DataSource = null
		const config = new Config()
		const databaseconfig = config.get<any>("DATABASE_CONFIG", Variable.DATABASE_DEFAULT)
		if (databaseconfig.type == Variable.SQLITE_TYPE) {
			let path = databaseconfig.path
			let filedata = join(DirRoot, path)
			this._logger.info(filedata)
			AppDataSource = new DataSource({
				type: Variable.SQLITE_TYPE,
				database: filedata,
				synchronize: true,
				//logging: true,
				entities: Models,//['src/core/database/models/**/*.ts'],
				subscribers: [PropertySubscriber],//['subscriber/**/*.ts'],
				migrations: [],
			});
		}

		let data = await AppDataSource.initialize().then(async (data) => {
			this._logger.info('connected')
			return data
		}).catch(error => {
			this._logger.error(error)
			// throw new Error("can't connect to database")
		});
		return data
	}
	async createDataSource(name: string) {
		if (this._datasources[name]) {
			return this._datasources[name]
		}
		let datasource = await this.connect()
		this._datasources[name] = datasource
		return datasource
	}
	getDataSource(name: string): DataSource | null {
		return this._datasources[name]
	}
}

//export {
// TypeProperty,
// PropertySubscriber,
// Authentication,
//AuthContentDocument,
//BaseDocument,
//BaseMedia,
//ObjectBase,
//ObjectMain,
// PropertyBase,
//User,
// ValueMedia,
// ValueObject,
// ValueStandard,
//}