import { DataSource, Repository } from 'typeorm';
import { User } from '../models/User';
import { LoggerHelper } from '../../common';
import { BaseResultCode } from '../common';
import { DataBase } from '..';
import { Config } from '../../config';

export class UserResult {
	code: BaseResultCode;
	success: boolean;
	data: User;
}

export default class UserRepository {
	private _logger:LoggerHelper;
	private _dataSource: DataSource;
	private _repository: Repository<User>;
	constructor() {
		let data = new DataBase()
		const config = new Config()
    this._dataSource = data.getDataSource(config.get<string>('DATABASE_BASE'));
		this._repository = this._dataSource?.getRepository(User);
		this._logger = new LoggerHelper('User Repository');
	}
	async findOneByEmail(email: string): Promise<User | null> {
		let user = await this._repository.findOne({
			// relations: {
			// 	connect: {
			// 		document: true,
			// 	},
			// },
			where: { email: email }
		});
		return user;
	}

	async login(email: string, pass: string): Promise<User | null> {
		const user = await this.findOneByEmail(email);
		if (user && user.checkPassword(pass)) {
			return user;
		}
	}

	async create(data: User): Promise<UserResult> {
		let new_user = this._repository.create(data);
		let result = new UserResult();
		try {
			let user = await this._repository.findOneBy({ email: new_user.email });
			if (!user) {
				result.data = await this._repository.save(new_user);
			} else {
				result.success = false;
				result.code = BaseResultCode.B004;
			}
		} catch (ex) {
			this._logger.error(`Update failed.\n${ex}`);
			result.success = false;
			result.code = BaseResultCode.B001;
		}
		return result;
	}

	// async update(data: User): Promise<UserResult> {
	// 	let result = new UserResult();
	// 	try {
	// 		let user = User.getByRequest(this._request);
	// 		if (user) {
	// 			let userafter = Object.assign(user, data);
	// 			let recore = await this._repository.save(
	// 				this._repository.create(userafter),
	// 			);
	// 			if (recore) {
	// 				result.data = recore;
	// 			} else {
	// 				result.success = false;
	// 				result.code = BaseResultCode.B003;
	// 			}
	// 		} else {
	// 			result.success = false;
	// 			result.code = BaseResultCode.B002;
	// 		}
	// 	} catch (ex) {
	// 		this._logger.error(`Update failed.\n${ex}`);
	// 		result.success = false;
	// 		result.code = BaseResultCode.B001;
	// 	}
	// 	return result;
	// }

	// get(): User {
	// 	let user = User.getByRequest(this._request);
	// 	return user
	// }
}
