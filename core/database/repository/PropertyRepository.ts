import { Authorization, BaseError, LoggerHelper, TypeFunction } from "../../common";
import { DataSource, FindManyOptions, FindOptionsWhere, In, Repository } from "typeorm";
import { ObjectBase } from "../models/ObjectBase";
import { BaseResultCode, MainProperty } from "../common";
import { User } from "../models/User";
import { ObjectMain } from "../models/ObjectMain";
import { PropertyBase } from "../models/Property";
import { DataBase } from "..";
import { Config } from '../../config';
import { AuthContentDocument } from "database/models/Document";
import { Variable } from "../../constants";

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

	constructor(private _lang:string) {
		let data = new DataBase()
		const config = new Config()
		this._dataSource = data.getDataSource(config.get<string>('DATABASE_BASE'));
		this._repository = this._dataSource.getRepository(PropertyBase);
		this.objectRepository = this._dataSource.getRepository(ObjectBase)
		const queryRunner = this._dataSource.createQueryRunner()
		queryRunner.data[Variable.LANG] = this._lang
	}

	async get(autho: AuthContentDocument, objectid: string): Promise<PropertyBase[]>
	async get(autho: AuthContentDocument, objectid: string, id: number): Promise<PropertyBase>
	async get(autho: AuthContentDocument, objectid: string, id: number = null) {
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
			
	}

	async create(autho: AuthContentDocument, id: string, data: PropertyBase): Promise<PropertyBase | null> {
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
	}

	async creates(autho: AuthContentDocument, id: string, items: PropertyBase[]): Promise<PropertyBase[]> {

				let obj = await this.objectRepository.findOneBy({
					id: id,
					document: { id: autho.document.id },
				});
				if (obj) {
					items.map((data) => {
						data.parent = obj;
						data.parent.document = autho.document;
					});
					return await this._repository.save(items);
				} else {
					throw new BaseError(BaseResultCode.B002);
				}
			
	}

	async update(autho: AuthContentDocument, item: PropertyBase): Promise<PropertyBase | null> {
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
					data.AfterUpdate(this._dataSource, this._lang);
					let rowdata = await this._repository.save(data);
					rowdata.value = data.value;
					return rowdata;
				} else {
					return null
				}
			
	}
	async updates(autho: AuthContentDocument, id: string, items: PropertyBase[]): Promise<PropertyBase[]> {
				var records = await this._repository.find({
					relations: {
						parent: true,
					},
					where: {
						id: In(items.map(n => n.id)),
						parent: {
							id: id,
							document: {
								id: autho.document.id
							}
						},
					},
				});
				let datas = []
				for (let index = 0; index < records.length; index++) {
					const record = records[index];
					let item = items.find(x => x.id == record.id)
					if (
						record &&
						(!item.type || new MainProperty().checkType(item.type.toString()))
					) {
						let data = Object.assign(record, item);
						data.parent.document = autho.document;
						delete data.connectStandard
						delete data.connectMeida
						delete data.connectObject
						await data.AfterUpdate(this._dataSource,this._lang);
						datas.push(data)
						item.value = data.value
						// let rowdata = await this._repository.save(data);
						// rowdata.value = data.value;
						// result.data = rowdata;
						// return datas
					} else {
						throw new BaseError(BaseResultCode.B002);
					}
				}

				items.map((data) => {
					if (!data.id) {
						data.parent = ObjectBase.create(id);
						data.parent.document = autho.document;
						datas.push(data)
					}
				});
				let rowdatas = await this._repository.save(datas);
				return rowdatas
			
	}

	async delete(autho: AuthContentDocument, id: number, softDelete = true): Promise<boolean> {
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
	}

	async deletes(autho: AuthContentDocument, ids: number[], softDelete = true): Promise<boolean> {
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
	}

	async restore(autho: AuthContentDocument, id: number): Promise<boolean> {
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
	}
}