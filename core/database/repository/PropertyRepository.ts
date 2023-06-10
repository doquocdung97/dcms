import { Authorization, BaseError, LoggerHelper, TypeFunction } from "../../common";
import { DataSource, FindManyOptions, FindOptionsWhere, In, Repository } from "typeorm";
import { ObjectBase } from "../models/ObjectBase";
import { BaseResultCode, MainProperty } from "../common";
import { User } from "../models/User";
import { ObjectMain } from "../models/ObjectMain";
import { PropertyBase } from "../models/Property";
import { DataBase } from "..";
import { Config } from '../../config';

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
	private objectRepository: Repository<ObjectBase>;

	constructor() {
		let data = new DataBase()
		const config = new Config()
		this._dataSource = data.getDataSource(config.get<string>('DATABASE_BASE'));
		this._repository = this._dataSource.getRepository(PropertyBase);
		this.objectRepository = this._dataSource.getRepository(ObjectBase)
	}

	async get(user: User, objectid: string): Promise<PropertyBase[]>
	async get(user: User, objectid: string, id: number): Promise<PropertyBase>
	async get(user: User, objectid: string, id: number = null) {
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
							id: objectid,
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

	async create(user: User, id: string, data: PropertyBase): Promise<PropertyBase | null> {
		let result = await Authorization(
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
					return record;
				} else {
					throw new BaseError(BaseResultCode.B002);
				}
			});
		return result;
	}

	async creates(user: User, id: string, items: PropertyBase[]): Promise<PropertiesResult> {
		let result = new PropertiesResult();
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

	async update(user: User, item: PropertyBase): Promise<PropertyBase|null> {
		let result = await Authorization(
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
					return rowdata;
				} else {
					return null
				}
			}
		);
		return result;
	}
	async updates(user: User, id: string, items: PropertyBase[]): Promise<PropertiesResult> {
		let result = new PropertiesResult();
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

	async delete(user: User, id: number, softDelete = true): Promise<boolean> {
		let result = await Authorization(
			user,
			TypeFunction.DELETE,
			async (autho) => {
				let data = null;
				let option: FindOptionsWhere<PropertyBase> = {
					id: id,
					parent: { document: { id: autho.document.id } },
				};
				let result = await this._repository.findOne({ where: option })
				if (result) {
					if (softDelete) {
						data = await this._repository.softDelete({ id: id });
					} else {
						data = await this._repository.delete({ id: id });
					}
					if (data && data.affected > 0) {
						return true;
					}
				}
				return false;
			});
		return result;
	}

	async deletes(user: User, ids: number[], softDelete = true): Promise<boolean> {
		let result = await Authorization(
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
					return false
				}
				return true
			});
		return result;
	}

	async restore(user: User, id: number): Promise<boolean> {
		let result = await Authorization(
			user,
			TypeFunction.DELETE,
			async (autho) => {
				let result = await this._repository.findOne({
					withDeleted: true, where: {
						id: id,
						parent: { document: { id: autho.document.id } },
					}
				})
				if (result) {
					let data = await this._repository.restore({
						id: id
					});
					if (data && data.affected > 0) {
						return true;
					}
				}
				return false
			});
		return result;
	}
}