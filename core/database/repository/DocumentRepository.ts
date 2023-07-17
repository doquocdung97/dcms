import { DataSource, Repository, In, FindManyOptions, Not, IsNull } from 'typeorm';
import { AuthContentDocument, BaseDocument, Role } from '../models/Document';
import { Authorization, DirRoot, FileHelper, handleUpdateJoinTable, BaseError, LoggerHelper, TypeFunction } from '../../common';
import { plainToClass } from 'class-transformer';
import { User } from '../models/User';
import { BaseResultCode } from '../common';
import { DataBase } from '..';
import { join, basename, extname, dirname } from 'path';
import { Config } from '../../config';

export class DocumentResult {
  code: BaseResultCode;
  success: boolean;
  data: BaseDocument;
}

export default class DocumentRepository {
  private _logger:LoggerHelper;
  private _dataSource: DataSource;
  private _repository: Repository<BaseDocument>;
  private _userRepository: Repository<User>;
  private _acdRepository: Repository<AuthContentDocument>;
  constructor() {
    let data = new DataBase()
    const config = new Config()
    this._dataSource = data.getDataSource(config.get<string>('DATABASE_BASE'));
    this._repository = this._dataSource.getRepository(BaseDocument);
    this._userRepository = this._dataSource.getRepository(User);
    this._acdRepository = this._dataSource.getRepository(AuthContentDocument);
    this._logger = new LoggerHelper('Document Repository');
  }

  async get(): Promise<BaseDocument[]>
  async get(id: string): Promise<BaseDocument>
  async get(id: string = null) {
    let option: FindManyOptions<BaseDocument> = {
      relations: {
        auths: {
          user: true,
        },
        // objects: {
        //   properties: {
        //     connectObject: true,
        //     connectMeida: true,
        //   },
        // },
      },
      where: {
        id: id,
        // auths: {
        //   user: {
        //     id: user.id
        //   }
        // }
      },
    };
    if (id) {
      let result = await this._repository.findOne(option);
      // let hasuser = result.auths.find((x) => x.user?.id == user.id);
      // if (hasuser)
      return result;
    }
    let list: BaseDocument[] = [];
    let result = await this._repository.find(option);
    return result
    // result.map((doc) => {
    //   let hasuser = doc.auths.find((x) => x.user?.id == user.id);
    //   if (hasuser) {
    //     list.push(doc);
    //   }
    // });
    // return list;
  }

  /**
  * 
  * @param user 
  * @param input 
  * @returns BaseDocument
  */
  async create(user: User, input: BaseDocument): Promise<BaseDocument> {
    try {
      let autho = new AuthContentDocument(Role.SUPERADMIN, user)
      input.auths = [autho]
      await this._acdRepository.save(input.auths);
      return await this._repository.save(input);
    } catch (error) {
      this._logger.error(`Create failed ${error}`)
      // result.success = false
      // result.code = BaseResultCode.B001
      throw new Error(`Create failed ${error}`)
    }
  }

  async update(autho: AuthContentDocument, input: BaseDocument): Promise<BaseDocument> {
    if (autho.role == Role.SUPERADMIN && input.id == autho.document.id) {
      let record = (await this.get(input.id)) as BaseDocument;
      if (record) {
        let connect = await this._acdRepository.find({
          relations: {
            document: true,
            user: true,
          },
          where: {
            document: {
              id: input.id,
            },
          },
        });
        let auth_create = connect.find((x) => x.role == Role.SUPERADMIN);
        let user_ids = input.auths
          .filter((auth) => auth.user.id != auth_create.user.id)
          .map((auth) => auth.user.id);
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
              value = this._acdRepository.create(value);
              return value;
            }
          },
        );
        let rowdata = join.create_item.concat(join.update_item, auth_create);
        if (join.delete_item.length > 0) {
          await this._acdRepository.remove(join.delete_item);
        }
        let result = await this._repository.save(input);
        result = Object.assign(result, record);
        result.auths = await this._acdRepository.save(rowdata);
        return result
      } else {
        throw new BaseError(BaseResultCode.B002)
      }
    } else {
      throw new BaseError(BaseResultCode.B002)
    }
  }
  async createAuth(auth: AuthContentDocument): Promise<AuthContentDocument> {
    auth.setValueByRole(auth.role)
    if (!auth.token) {
      let connect = await this._acdRepository.findOne({
        relations: {
          document: true,
          user: true,
        },
        where: {
          document: {
            id: auth.document.id,
          },
          user: {
            id: auth.user.id
          },
          token:IsNull()
        },
      });
      if (!connect) {
        let user_auth = await this._userRepository.findOne({ where: { id: auth.user.id } })
        if (user_auth) {
          auth.user = user_auth
          let result = await this._acdRepository.save(auth)
          return result
        }
      }
    } else if (auth.token) {
      let result = await this._acdRepository.save(auth)
      return result
    }
    return null
  }
  async updateAuth(id:number, auth: AuthContentDocument): Promise<AuthContentDocument> {
    auth.setValueByRole(auth.role)
    if (auth.user?.id) {
      let connect = await this._acdRepository.findOne({
        relations: {
          document: true,
          user: true,
        },
        where: {
          id:id,
          document: {
            id: auth.document.id,
          }
        },
      });
      if (connect) {
        auth.user = connect.user
        auth.id = connect.id
        let result = await this._acdRepository.save(auth)
        return result
      }
    }
    return null
  }
  async deleteAuth(id: number): Promise<boolean> {
    let result = await this._acdRepository.delete({ id: id })
    return result?.affected > 0
  }

  async getByToken(token: string): Promise<BaseDocument | null> {
    if(!token){
      return null
    }
    let option: FindManyOptions<BaseDocument> = {
      relations: {
        auths: {
          user:true
        }
      },
      where: {
        auths: {
          token: token
        }
      },
    };
    let doc =  await this._repository.findOne(option);
    return doc
  }
}
