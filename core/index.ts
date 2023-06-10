import { BaseResultCode } from './database/common'
import * as Models from './database'
import * as Extensions from './Extensions'
import * as Media from './Media'
import * as Base from './base'

import { parseBoolean, LoggerHelper, FileUpload, getFileName } from './common'
import { App } from './base'

import { Config } from './config'
import { TypeFunction } from './common'
import { InputRole, Role } from './database/models/Document';

//module base
import * as User from './base/user'
import * as Document from './base/document'
import * as Objective from './base/object'
import * as Property from './base/property'

// interface DataBaseConfig{
// 	type:string
// 	path:string
// }

// interface CMSOption {
// 	database: DataBaseConfig
// 	secretkey:string
// }
class CMS {
	static App = App
	private _config :Config
	private _path:string
	constructor(path:string) {
		this._config = new Config()
		this._path = path
	}
	async init() {
		await this._config.load(this._path)
		let database = new Models.DataBase()
		return await database.createDataSource(this._config.get<string>('DATABASE_BASE'))
	}
	// static async create(option: CMSOption) {
	// 	let cms = new CMS(option)
	// 	return cms
	// }
}
// export const Media = {
// 	FileUpload,
// 	getFileName
// }
export {
	CMS,
	Base,
	Models,
	Extensions,
	Media,
	//module base
	Document,
	Objective,
	User,
	Property,

	BaseResultCode,

	LoggerHelper,
	TypeFunction,
	InputRole,
	Role
}