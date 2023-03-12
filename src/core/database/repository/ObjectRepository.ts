import { Authorization, LoggerHelper, TypeFunction } from "src/core/common";
import { DataSource, FindManyOptions, Repository } from "typeorm";
import { ObjectBase } from "../models/ObjectBase";
import { BaseResult, BaseResultCode } from "../common";
import { User } from "../models/User";
import { ObjectMain } from "../models/ObjectMain";
import PropertyRepository from "./PropertyRepository";
import { DataBase } from "..";
import { DatabaseConfig } from "src/constants";

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
	private _request: any;
	private _propertyRepository: PropertyRepository

	constructor(request: any) {
		let data = new DataBase()
		this._dataSource = data.getDataSource(DatabaseConfig.MAIN);
		this._request = request;
		this._repository = this._dataSource.getRepository(ObjectBase);
		this.objectmainRepository = this._dataSource.getRepository(ObjectMain);
		this._propertyRepository = new PropertyRepository(request)
	}

	async get(id: string = null) {
		let user = User.getByRequest(this._request);
		return await Authorization(
			user,
			TypeFunction.QUERY,
			async (autho) => {
				let option: FindManyOptions<ObjectBase> = {
					relations: {
						properties: {
							connectObject: true,
							connectMeida: true,
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

	async getTree(documentId: string) {
    return null;
  }

	async create(parentId: string, obj: ObjectBase): Promise<ObjectResult> {
		let result = new ObjectResult();
		let user = User.getByRequest(this._request);
		await Authorization(
			user,
			TypeFunction.CREATE,
			async () => {
				let data = await this._repository.save(obj);
				if (data && obj.properties) {
					let record = await this._propertyRepository.creates(
						data.id,
						data.properties,
					);
					if (record.success) {
						data.properties = record.data;
					}
				}
				var main = await this.objectmainRepository.create();
				main.detail = obj;
				if (parentId) {
					let parent = new ObjectMain();
					parent.id = parentId;
					main.parent = parent;
					main.name = data.name;
				}
				await this.objectmainRepository.save(main);
				result.data = data;
			},
			(err) => {
				this._logger.error(
					`Create failed.\nWith info:\n${JSON.stringify(obj)}.\n${err}`,
				);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}

	async update(obj: ObjectBase): Promise<ObjectResult> {
		let result = new ObjectResult();
		let user = User.getByRequest(this._request);
		await Authorization(
			user,
			TypeFunction.EDIT,
			async () => {
				let data = await this._repository.findOne({ where: { id: obj.id }, });
				if (data) {
					result.data = await this._repository.save(obj);
				} else {
					result.success = false;
					result.code = BaseResultCode.B002;
				}
			},
			(err) => {
				this._logger.error(
					`Update failed.\nWith info:\n${JSON.stringify(obj)}.\n${err}`,
				);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}


	async delete(id: string, softDelete = true): Promise<BaseResult> {
		let result = new BaseResult();
		let user = User.getByRequest(this._request);
		let data = await this._repository.findOne({ where: { id: id } });
		if (!data) {
			result.success = false;
			result.code = BaseResultCode.B002;
			return result;
		}
		await Authorization(
			user,
			TypeFunction.DELETE,
			async () => {
				if (softDelete) {
					await this._repository.softDelete({ id: id });
				} else {
					await this._repository.delete({ id: id });
				}
			},
			(ex) => {
				this._logger.error(`Delete failed.\n${ex}`);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}

	async restore(id: string): Promise<BaseResult> {
		let result = new BaseResult();
		let user = User.getByRequest(this._request);
		let data = await this._repository.findOne({ where: { id: id } });
		if (!data) {
			result.success = false;
			result.code = BaseResultCode.B002;
			return result;
		}
		await Authorization(
			user,
			TypeFunction.DELETE,
			async () => {
				await this._repository.restore({ id: id });
			},
			(ex) => {
				this._logger.error(`Restore failed.\n${ex}`);
				result.success = false;
				result.code = BaseResultCode.B001;
			},
		);
		return result;
	}
}