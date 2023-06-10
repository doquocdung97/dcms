import { Authorization, LoggerHelper, TypeFunction } from "src/core/common";
import { DataSource, FindManyOptions, FindOptionsWhere, In, Repository } from "typeorm";
import { ObjectBase } from "../models/ObjectBase";
import { BaseResult, BaseResultCode, MainProperty } from "../common";
import { User } from "../models/User";
import { ObjectMain } from "../models/ObjectMain";
import { PropertyBase } from "../models/Property";
import { DataBase } from "..";
import { DatabaseConfig } from "src/constants";

export class PropertyResult {
	code: BaseResultCode;
	success: boolean;
	data: PropertyBase;
}

export class PropertiesResult {
	code: BaseResultCode;
	success: boolean;
	data: PropertyBase[];
}


export default class PropertyRepository {
	private _logger = new LoggerHelper('Property Repository');
	private _dataSource: DataSource;
	private _repository: Repository<PropertyBase>;
	private _request: any;
	private objectRepository: Repository<ObjectBase>;

	constructor(request: any) {
		let data = new DataBase()
		this._dataSource = data.getDataSource(DatabaseConfig.MAIN);
		this._request = request;
		this._repository = this._dataSource.getRepository(PropertyBase);
		this.objectRepository = this._dataSource.getRepository(ObjectBase)
	}
	getRepository() {
		return this._repository
	}
	async get(id: number = null) {
		let user = User.getByRequest(this._request);
		return await Authorization(
			user,
			TypeFunction.QUERY,
			async (autho) => {
				let option: FindManyOptions<PropertyBase> = {
					relations: {
						parent: {
							document: true,
						},
						connectObject: true,
						connectMeida: true,
						connectStandard: true
					},
					where: {
						id: id,
						parent: {
							document: {
								id: autho.document.id,
							},
						},
					},
				};
				if (id) {
					return await this._repository.findOne(option);
				}
				return await this._repository.find(option);
			},
			async (ex) => {
				this._logger.error(`Get failed.\n${ex}`);
			},
		);
	}

	async create(id: string, data: PropertyBase): Promise<PropertyResult> {
		let result = new PropertyResult();
		let user = User.getByRequest(this._request);
		await Authorization(
			user,
			TypeFunction.CREATE,
			async (autho) => {
				let obj = await this.objectRepository.findOneBy({
					id: id,
					document: { id: autho.document.id },
				});
				if (obj) {
					data.parent = obj;
					data.parent.document = autho.document;
					let record = await this._repository.save(data);
					result.data = record;
				} else {
					result.success = false;
					result.code = BaseResultCode.B002;
				}
			},
			async (ex) => {
				this._logger.error(`Create failed.\n${ex}`);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}

	async creates(id: string, items: PropertyBase[]): Promise<PropertiesResult> {
		let result = new PropertiesResult();
		let user = User.getByRequest(this._request);
		await Authorization(
			user,
			TypeFunction.CREATE,
			async (autho) => {
				let obj = await this.objectRepository.findOneBy({
					id: id,
					document: { id: autho.document.id },
				});
				if (obj) {
					items.map((data) => {
						data.parent = obj;
						data.parent.document = autho.document;
					});
					let record = await this._repository.save(items);
					result.data = record;
				} else {
					result.success = false;
					result.code = BaseResultCode.B002;
				}
			},
			async (ex) => {
				this._logger.error(`Creates failed.\n${ex}`);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}

	async update(item: PropertyBase): Promise<PropertyResult> {
		let result = new PropertyResult();
		let user = User.getByRequest(this._request);
		await Authorization(
			user,
			TypeFunction.EDIT,
			async (autho) => {
				var record = await this._repository.findOne({
					relations: {
						parent: true,
					},
					where: {
						id: item.id,
						parent: { document: { id: autho.document.id } },
					},
				});
				if (
					record &&
					(!item.type || new MainProperty().checkType(item.type.toString()))
				) {
					let data = Object.assign(record, item);
					data.parent.document = autho.document;
					data.AfterUpdate(this._dataSource);
					let rowdata = await this._repository.save(data);
					rowdata.value = data.value;
					result.data = rowdata;
				} else {
					result.success = false;
					result.code = BaseResultCode.B002;
				}
			},
			async (ex) => {
				this._logger.error(`Update failed.\n${ex}`);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}
	async updates(id: string, items: PropertyBase[]): Promise<PropertiesResult> {
		let result = new PropertiesResult();
		let user = User.getByRequest(this._request);
		await Authorization(
			user,
			TypeFunction.EDIT,
			async (autho) => {
				var records = await this._repository.find({
					relations: {
						parent: true,
					},
					where: {
						name: In(items.map(n => n.name)),
						parent: {
							id: id,
							document: {
								id: autho.document.id
							}
						},
					},
				});
				let datas = []
				records.map((record, index) => {
					let item = items.find(x => x.name == record.name)
					if (
						record &&
						(!item.type || new MainProperty().checkType(item.type.toString()))
					) {
						let data = Object.assign(record, item);
						data.parent.document = autho.document;
						data.AfterUpdate(this._dataSource);
						datas.push(data)
						// let rowdata = await this._repository.save(data);
						// rowdata.value = data.value;
						// result.data = rowdata;
					} else {
						result.success = false;
						result.code = BaseResultCode.B002;
						return result
					}
				})
				let rowdatas = await this._repository.save(datas);
				result.data = rowdatas
			},
			async (ex) => {
				this._logger.error(`Update failed.\n${ex}`);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}

	async delete(id: number, softDelete = true): Promise<BaseResult> {
		let result = new BaseResult();
		let user = User.getByRequest(this._request);
		await Authorization(
			user,
			TypeFunction.DELETE,
			async (autho) => {
				let data = null;
				let option: FindOptionsWhere<PropertyBase> = {
					id: id,
					parent: { document: { id: autho.document.id } },
				};
				if (softDelete) {
					data = await this._repository.softDelete(option);
				} else {
					data = await this._repository.delete(option);
				}
				if (data && data.affected <= 0) {
					result.success = false;
					result.code = BaseResultCode.B002;
				}
			},
			async (ex) => {
				this._logger.error(`Delete failed.\n${ex}`);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}

	async deletes(ids: number[], softDelete = true): Promise<BaseResult> {
		let result = new BaseResult();
		let user = User.getByRequest(this._request);
		await Authorization(
			user,
			TypeFunction.DELETE,
			async (autho) => {
				let data = null;
				let option: FindOptionsWhere<PropertyBase> = {
					id: In(ids),
					parent: { document: { id: autho.document.id } },
				};
				let rowdata = await this._repository.findBy(option);
				if (softDelete) {
					data = await this._repository.softDelete({ id: In(rowdata.map(item => item.id)) });
				} else {
					data = await this._repository.delete({ id: In(rowdata.map(item => item.id)) });
				}
				if (data && data.affected <= 0) {
					result.success = false;
					result.code = BaseResultCode.B002;
				}
			},
			async (ex) => {
				this._logger.error(`Delete failed.\n${ex}`);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}

	async restore(id: number): Promise<BaseResult> {
		let result = new BaseResult();
		let user = User.getByRequest(this._request);
		await Authorization(
			user,
			TypeFunction.DELETE,
			async (autho) => {
				let data = await this._repository.restore({
					id: id,
					parent: { document: { id: autho.document.id } },
				});
				if (data.affected <= 0) {
					result.success = false;
					result.code = BaseResultCode.B002;
				}
			},
			async (ex) => {
				this._logger.error(`Delete failed.\n${ex}`);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}
}