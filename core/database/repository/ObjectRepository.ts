import { Authorization, BaseError, LoggerHelper, TypeFunction } from "../../common";
import { DataSource, FindManyOptions, In, Repository } from "typeorm";
import { ObjectBase } from "../models/ObjectBase";
import { BaseResultCode } from "../common";
import { User } from "../models/User";
import { ObjectMain } from "../models/ObjectMain";
// import PropertyRepository from "./PropertyRepository";
import { DataBase } from "..";
import { Config } from '../../config';

export class ObjectResult {
	code: BaseResultCode;
	success: boolean;
	data: ObjectBase;
}

export default class ObjectRepository {
	private _logger = new LoggerHelper('Object Repository');
	private _dataSource: DataSource;
	private _repository: Repository<ObjectBase>;
	private objectmainRepository: Repository<ObjectMain>
	// private _request: any;
	// private _propertyRepository: PropertyRepository

	constructor() {
		let data = new DataBase()
		const config = new Config()
		this._dataSource = data.getDataSource(config.get<string>('DATABASE_BASE'));
		this._repository = this._dataSource.getRepository(ObjectBase);
		this.objectmainRepository = this._dataSource.getRepository(ObjectMain);
		// this._propertyRepository = new PropertyRepository(request)
	}
	
	async get(user: User, id:string): Promise<ObjectBase>
	async get(user: User): Promise<ObjectBase[]>
	async get(user: User, id: string = null) {
		return await Authorization(
			user,
			TypeFunction.QUERY,
			async (autho) => {
				let option: FindManyOptions<ObjectBase> = {
					relations: {
						properties: {
							connectObject: true,
							connectMeida: true,
							connectStandard: true
						},
					},
					where: {
						id: id,
						document: {
							id: autho.document.id,
						},
					},
				};
				if (id) {
					let data = await this._repository.findOne(option);
					return data;
				}
				let data = await this._repository.find(option);
				return data;
			},
			(ex) => {
				this._logger.error(
					`GET failed.\nWith info:\nid: ${id}.\n${ex}`,
				);
			},
		);
	}
	async getfilter(user: User, type: string = null,skip:number = 0,take:number = null): Promise<[ObjectBase[],number]>{
		return await Authorization(
			user,
			TypeFunction.QUERY,
			async (autho) => {
				let option: FindManyOptions<ObjectBase> = {
					relations: {
						properties: {
							connectObject: true,
							connectMeida: true,
							connectStandard: true
						},
					},
					where: {
						type: type,
						document: {
							id: autho.document.id,
						},
					},
					skip:skip,
					take:take,
					order:{
						createdAt:"desc"
					}
				};
				let data = await this._repository.findAndCount(option);
				return data;
			}
		);
	}
	async getByName(user: User, name: string): Promise<ObjectBase> {
		return await Authorization(
			user,
			TypeFunction.QUERY,
			async (autho) => {
				let option: FindManyOptions<ObjectBase> = {
					relations: {
						properties: {
							connectObject: true,
							connectMeida: true,
							connectStandard: true
						},
					},
					where: {
						name: name,
						document: {
							id: autho.document.id,
						},
					},
				};
				let data = await this._repository.findOne(option);
				return data;
			},
			(ex) => {
				this._logger.error(
					`GET failed.\nWith info:\nname: ${name}.\n${ex}`,
				);
			},
		);
	}

	async getTree(documentId: string) {
		return null;
	}

	async create(user: User, parentId: string, obj: ObjectBase): Promise<ObjectBase> {
		let result = await Authorization(
			user,
			TypeFunction.CREATE,
			async (autho) => {
				obj.document = autho.document
				let data = await this._repository.save(obj);
				// if (data && obj.properties) {
				// 	let record = await this._propertyRepository.creates(
				// 		data.id,
				// 		data.properties,
				// 	);
				// 	if (record.success) {
				// 		data.properties = record.data;
				// 	}
				// }
				var main = await this.objectmainRepository.create();
				main.detail = obj;
				if (parentId) {
					let parent = new ObjectMain();
					parent.id = parentId;
					main.parent = parent;
					main.name = data.name;
				}
				await this.objectmainRepository.save(main);
				return data;
			});
		return result;
	}

	async update(user: User, obj: ObjectBase): Promise<ObjectBase|null> {
		let result = await Authorization(
			user,
			TypeFunction.EDIT,
			async () => {
				let data = await this._repository.findOne({ where: { id: obj.id }, });
				if (data) {
					let result = await this._repository.save(Object.assign(data,obj));
					return result
				} else {
					return null
				}
			});
		return result;
	}

	async delete(user: User, id: string, softDelete = true): Promise<boolean> {

		let result = await Authorization(
			user,
			TypeFunction.DELETE,
			async (autho) => {
				let data = null;
				if (softDelete) {
					data = await this._repository.softDelete({ 
						id: id,
						document: { id: autho.document.id },
					 });
				} else {
					data = await this._repository.delete({ 
						// id: id ,
						document: { id: autho.document.id },
					});
				}
				if (data && data.affected <= 0) {
          return false
        }
        return true
			}
		);
		return result;
	}

	async deletes(user: User, id: string[], softDelete = true): Promise<boolean> {
		let result = await Authorization(
			user,
			TypeFunction.DELETE,
			async (autho) => {
				let data = null;
				if (softDelete) {
					data = await this._repository.softDelete({ 
						id: In(id),
            document: { id: autho.document.id },
					 });
				} else {
					data = await this._repository.delete({
						 id: In(id),
						 document: { id: autho.document.id },
						 });
				}
				if (data && data.affected <= 0) {
          return false
        }
        return true
			});
		return result;
	}

	async restore(user: User, id: string): Promise<boolean> {
		let result = await Authorization(
			user,
			TypeFunction.DELETE,
			async (autho) => {
				let data = await this._repository.restore({ 
					id: id ,
          document: { id: autho.document.id },
				});
				if (data.affected <= 0) {
          return false
        }
        return true
			});
		return result;
	}
}