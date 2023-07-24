import { BaseError, LoggerHelper, TypeFunction } from "../../common";
import { DataSource, FindManyOptions, In, Repository } from "typeorm";
import { ObjectBase } from "../models/ObjectBase";
import { BaseResultCode } from "../common";
import { User } from "../models/User";
import { ObjectMain } from "../models/ObjectMain";
// import PropertyRepository from "./PropertyRepository";
import { DataBase } from "..";
import { Config } from '../../config';
import { AuthContentDocument } from "database/models/Document";
import { Variable } from "../../constants";

export class ObjectResult {
	code: BaseResultCode;
	success: boolean;
	data: ObjectBase;
}

export default class ObjectRepository {
	private _logger:LoggerHelper; 
	private _dataSource: DataSource;
	private _repository: Repository<ObjectBase>;
	private objectmainRepository: Repository<ObjectMain>
	// private _request: any;
	// private _propertyRepository: PropertyRepository

	constructor(private _lang:string) {
		let data = new DataBase()
		const config = new Config()
		this._dataSource = data.getDataSource(config.get<string>('DATABASE_BASE'));
		this._repository = this._dataSource.getRepository(ObjectBase);
		this.objectmainRepository = this._dataSource.getRepository(ObjectMain);
		// this._propertyRepository = new PropertyRepository(request)
		const queryRunner = this._dataSource.createQueryRunner()
		queryRunner.data[Variable.LANG] = this._lang

		this._logger = new LoggerHelper('Object Repository');
	}
	
	async get(autho: AuthContentDocument, id:string): Promise<ObjectBase>
	async get(autho: AuthContentDocument): Promise<ObjectBase[]>
	async get(autho: AuthContentDocument, id: string = null) {
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
	}
	async getfilter(autho: AuthContentDocument, type: string = null,skip:number = 0,take:number = null,level:number = 0): Promise<[ObjectBase[],number]>{
		let option: FindManyOptions<ObjectBase> = {
			relations: {
				properties: this.levelRelations(level-1),
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
	levelRelations (lel){
		if(lel ==0){
			return {
				connectMeida: true,
				connectStandard: true
			}
		}else if(lel < 0){
			return {}
		}
		return {
			connectObject: {
				object:{
					properties:this.levelRelations(lel-1)
				}
			},
			connectMeida: true,
			connectStandard: true
		}
	}
	async getByTypeOne(autho: AuthContentDocument, type: string, id: string,level:number = 0): Promise<ObjectBase>{
		let option: FindManyOptions<ObjectBase> = {
			relations: {
				properties: this.levelRelations(level-1),
			},
			where: {
				id:id,
				type: type,
				document: {
					id: autho.document.id,
				},
			},
		};
		let data = await this._repository.findOne(option);
		return data;
	}
	async getByName(autho: AuthContentDocument, name: string): Promise<ObjectBase> {
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
	}

	async getTree(documentId: string) {
		return null;
	}

	async create(autho: AuthContentDocument, parentId: string, obj: ObjectBase): Promise<ObjectBase> {
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
	}

	async update(autho: AuthContentDocument, obj: ObjectBase): Promise<ObjectBase|null> {
			let data = await this._repository.findOne({ where: { id: obj.id }, });
			if (data) {
				let result = await this._repository.save(Object.assign(data,obj));
				return result
			} else {
				return null
			}
	}

	async delete(autho: AuthContentDocument, id: string, softDelete = true): Promise<boolean> {
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

	async deletes(autho: AuthContentDocument, id: string[], softDelete = true): Promise<boolean> {
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
	}

	async restore(autho: AuthContentDocument, id: string): Promise<boolean> {
		let data = await this._repository.restore({ 
			id: id ,
			document: { id: autho.document.id },
		});
		if (data.affected <= 0) {
			return false
		}
		return true
	}
}