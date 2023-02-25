import { DataSource, Repository } from 'typeorm';
import { User } from '../models/User';
import { LoggerHelper } from 'core/common';
import { UserResult, ResultCode } from 'src/graphql/user/schema';
export default class UserRepository {
  private _logger = new LoggerHelper('User Repository');
  private _dataSource: DataSource;
  private _repository: Repository<User>;
  constructor(dataSource: DataSource) {
    this._dataSource = dataSource;
    this._repository = this._dataSource.getRepository(User);
  }
  async findOneByEmail(email: string): Promise<User | null> {
    let user = await this._repository.findOneBy({ email: email });
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
        result.code = ResultCode.B004;
      }
    } catch (ex) {
      this._logger.error(`Update failed.\n${ex}`);
      result.success = false;
      result.code = ResultCode.B001;
    }
    return result;
  }
  async update(data: User): Promise<UserResult> {
    let result = new UserResult();
    try {
      let user = await this._repository.findOneBy({ id: data.id });
      if (user) {
        let userafter = Object.assign(user, data);
        let recore = await this._repository.save(
          this._repository.create(userafter),
        );
        if (recore) {
          result.data = recore;
        } else {
          result.success = false;
          result.code = ResultCode.B003;
        }
      } else {
        result.success = false;
        result.code = ResultCode.B002;
      }
    } catch (ex) {
      this._logger.error(`Update failed.\n${ex}`);
      result.success = false;
      result.code = ResultCode.B001;
    }
    return result; //this.userRepository.save(user);
  }
}
