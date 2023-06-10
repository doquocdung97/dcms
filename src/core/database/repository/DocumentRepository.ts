import { DataSource, Repository, In, FindManyOptions, Not } from 'typeorm';
import { AuthContentDocument, BaseDocument, Role } from '../models/Document';
import { Authorization, DirRoot, FileHelper, handleUpdateJoinTable, LoggerHelper, TypeFunction } from 'core/common';
import { plainToClass } from 'class-transformer';
import { Authentication } from '../models/Authentication';
import { User } from '../models/User';
import { BaseResultCode } from '../common';
import { DataBase } from '..';
import { Config, DatabaseConfig, MediaConfig } from 'src/constants';
import { join, basename, extname, dirname } from 'path';
export class DocumentResult {
  code: BaseResultCode;
  success: boolean;
  data: BaseDocument;
}

export default class DocumentRepository {
  private _logger = new LoggerHelper('Document Repository');
  private _dataSource: DataSource;
  private _repository: Repository<BaseDocument>;
  private _userRepository: Repository<User>;
  private _acdRepository: Repository<AuthContentDocument>;
  private _request: any;
  constructor(request: any) {
    let data = new DataBase()
    this._dataSource = data.getDataSource(DatabaseConfig.MAIN);
    this._request = request;
    this._repository = this._dataSource.getRepository(BaseDocument);
    this._userRepository = this._dataSource.getRepository(User);
    this._acdRepository = this._dataSource.getRepository(AuthContentDocument);
  }
  async get(id: string = String()) {
    let user = User.getByRequest(this._request);
    if (!user) return;
    let option: FindManyOptions<BaseDocument> = {
      relations: {
        auths: {
          user: true,
        },
        objects: {
          properties: {
            connectObject: true,
            connectMeida: true,
          },
        },
      },
      where: {
        id: id,
      },
    };
    if (id) {
      let result = await this._repository.findOne(option);
      let hasuser = result.auths.find((x) => x.user.id == user.id);
      if (hasuser) return result;
    }
    let list = [];
    let result = await this._repository.find(option);
    result.map((doc) => {
      let hasuser = doc.auths.find((x) => x.user.id == user.id);
      if (hasuser) {
        list.push(doc);
      }
    });
    return list;
  }
  async getTemp(id: string) {
    let option: FindManyOptions<BaseDocument> = {
      relations: {
        auths: {
          user: true,
        },
        objects: {
          properties: {
            connectObject: true,
            connectMeida: true,
            connectStandard: true
          },
        },
        medias: true
      },
      where: {
        id: id,
      },
    };
    let result = await this._repository.findOne(option);
    return result;
  }

  async create(input: BaseDocument): Promise<DocumentResult> {
    let result = new DocumentResult()
    try {
      let user = User.getByRequest(this._request);
      let autho = new AuthContentDocument(Role.SUPERADMIN, user)
      input.auths = [autho]
      await this._acdRepository.save(input.auths);
      result.data = await this._repository.save(input);
    } catch (error) {
      this._logger.error(`Create failed ${error}`)
      result.success = false
      result.code = BaseResultCode.B001
    }
    return result;
  }

  async update(input: BaseDocument): Promise<DocumentResult> {
    let result_main = new DocumentResult()
    let user = User.getByRequest(this._request);
    await Authorization(
      user,
      TypeFunction.EDIT,
      async (autho) => {
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
            result_main.data = result
          } else {
            result_main.success = false
            result_main.code = BaseResultCode.B002
          }
        } else {
          result_main.success = false
          result_main.code = BaseResultCode.B002
        }
      },
      async (ex) => {
        this._logger.error(`Update failed ${ex}`)
        result_main.success = false
        result_main.code = BaseResultCode.B001
      },
    );
    return result_main;
  }
  async export(id) {
    let doc = await this.getTemp(id);
    if (!doc) {
      return null;
    }
    let filehelper = new FileHelper();
    let path_doc = join(Config.EXPORT_DIR, doc.id)
    doc.medias.map(media => {
      // let filename = filehelper.getFileName(media.url, true)
      filehelper.copy(join(MediaConfig.FORDER_FILE, media.url), join(path_doc, media.url))
    })
    // filehelper.deleteDir(path_doc)
    let data = JSON.stringify(doc, function (name, value) {
      if (name == "auths" || name.search('connect') == 0)
        return
      return value;
    });
    filehelper.saveFile(join(path_doc,'data.json'),data)
    return doc;
  }
}
