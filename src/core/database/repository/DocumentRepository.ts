import { DataSource, Repository, In, FindManyOptions, Not } from 'typeorm';
import { AuthContentDocument, BaseDocument, Role } from '../models/Document';
import { handleUpdateJoinTable, LoggerHelper } from 'core/common';
import { plainToClass } from 'class-transformer';
import { Authentication } from '../models/Authentication';
import { User } from '../models/User';

export default class DocumentRepository {
  private _logger = new LoggerHelper('Document Repository');
  private _dataSource: DataSource;
  private _repository: Repository<BaseDocument>;
  private _userRepository: Repository<User>;
  private _authRepository: Repository<Authentication>;
  private _authconnectdocumentRepository: Repository<AuthContentDocument>;
  private _request: any;
  constructor(dataSource: DataSource, request: any) {
    this._dataSource = dataSource;
    this._request = request;
    this._repository = this._dataSource.getRepository(BaseDocument);
    this._userRepository = this._dataSource.getRepository(User);
    this._authRepository = this._dataSource.getRepository(Authentication);
    this._authconnectdocumentRepository =
      this._dataSource.getRepository(AuthContentDocument);
  }
  async get(id: string = String()) {
    let user = User.getByRequest(this._request);
    if (!user) return;
    let option: FindManyOptions<BaseDocument> = {
      relations: {
        // auths: {
        //   //auth: true,
        //   user: true,
        // },
        objects:{
          properties:{
            connectObject: true,
            connectMeida: true,
          }
        }
        
      },
      where: {
        id: id,
      },
    };
    if (id) {
      return await this._repository.findOne(option);
    }
    return await this._repository.find(option);
  }
  getRepository(){
    return this._repository
  }
  async create(input: BaseDocument) {
    await this._authconnectdocumentRepository.save(input.auths);
    let result = await this._repository.save(input);
    return result;
  }
  async update(input: BaseDocument) {
    let record = (await this.get(input.id)) as BaseDocument;
    if (record) {
      let connect = await this._authconnectdocumentRepository.find({
        relations: {
          document: true,
          user: true,
        },
        where: {
          //role: Not(Role.SUPERADMIN),
          //user: {
          //  id: In(user_ids),
          //},
          document: {
            id: input.id,
          },
        },
      });
      //console.log(user_ids);
      //console.log(connect);
      let auth_create = connect.find((x) => x.role == Role.SUPERADMIN);
      let user_ids = input.auths
        .filter((auth) => auth.user.id != auth_create.user.id)
        .map((auth) => auth.user.id);
      console.log(user_ids);
      let users = await this._userRepository.find({
        where: { id: In(user_ids) },
      });
      let join = handleUpdateJoinTable<AuthContentDocument, User>(
        users,
        connect.filter((x) => x.role != Role.SUPERADMIN),
        (item, users, index) => {
          return item.user && item.user.id && index < users.length;
        },
        (auth, user) => {
          let value = input.auths.find((x) => x.user.id == user.id);
          if (value) {
            auth = Object.assign(auth, value);
            auth.setValueByRole();
            auth.user = user;
          }
        },
        (user) => {
          let auth = input.auths.find((x) => x.user.id == user.id);
          if (auth) {
            let value = plainToClass(AuthContentDocument, auth);
            value.setValueByRole();
            value.user = user;
            value.document = record;
            value = this._authconnectdocumentRepository.create(value);
            return value;
          }
        },
      );
      let rowdata = join.create_item.concat(join.update_item, auth_create);
      if (join.delete_item.length > 0) {
        await this._authconnectdocumentRepository.remove(join.delete_item);
      }
      let result = await this._repository.save(input);
      result.auths = await this._authconnectdocumentRepository.save(rowdata);
      return Object.assign(result, record);
    }
    return null;
  }
}
