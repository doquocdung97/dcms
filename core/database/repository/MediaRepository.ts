import { Authorization, BaseError, FileHelper, LoggerHelper, TypeFunction, handleUpdateJoinTable } from "../../common";
import { BaseMedia } from "../models/Media";
import { DataSource, FindManyOptions, In, Repository } from "typeorm";
import { AuthContentDocument, BaseDocument } from "../models/Document";
import { ValueMedia } from '../models/ValueMedia'
import { User } from '../models/User'
import { DataBase } from "..";
import { Variable } from "../../constants";
import { BaseResultCode } from "../common";
import { Config } from '../../config';

export class MediaResult {
  code: BaseResultCode;
  success: boolean;
  data: BaseMedia;
}

export class MediasResult {
  code: BaseResultCode;
  success: boolean;
  data: BaseMedia[];
}

export default class MediaRepository {
  private _logger = new LoggerHelper('Media Repository');
  private _filehelper = new FileHelper();
  private _dataSource: DataSource;
  private _repository: Repository<BaseMedia>;
  // private valueobjectRepository: Repository<ValueMedia>;
  // private propertyRepository: Repository<PropertyBase>;
  constructor() {
    let data = new DataBase()
    const config = new Config()
    this._dataSource = data.getDataSource(config.get<string>('DATABASE_BASE'));
    this._repository = this._dataSource.getRepository(BaseMedia);
    // this.valueobjectRepository = this._dataSource.getRepository(ValueMedia);
    // this.propertyRepository = this._dataSource.getRepository(PropertyBase);
  }
  async get(autho: AuthContentDocument):Promise<BaseMedia[]>
  async get(autho: AuthContentDocument, id):Promise<BaseMedia>
  async get(autho: AuthContentDocument, id = null) {
    let option: FindManyOptions<BaseMedia> = {
      where: {
        id: id,
        document: {
          id: autho.document.id,
        },
      },
      relations: {
        connect: {
          property: true,
        },
        user: true,
      },
    };
    if (id) {
      return await this._repository.findOne(option);
    }
    return await this._repository.find(option);
  }

  async getByUrl(autho: AuthContentDocument, url: string): Promise<BaseMedia> {

        let result = await this._repository.findOne({
          where: {
            url: url,
            document: { id: autho.document.id }
          },
          relations: {
            user: true,
          },
        });
        return result


  }

  async create(autho: AuthContentDocument, input: BaseMedia): Promise<BaseMedia> {
    return await this.createData(input, autho)
  }

  async creates(autho: AuthContentDocument, inputs: BaseMedia[]): Promise<BaseMedia[]> {
    let medias = [];
    for (let index = 0; index < inputs.length; index++) {
      const input = inputs[index];
      let media = await this.createData(input, autho);
      medias.push(media);
    }
    return medias;
  }

  async update(autho: AuthContentDocument, input: BaseMedia): Promise<BaseMedia> {

        let dataintable = await this._repository.findOne({
          where: {
            id: input.id,
            document: { id: autho.document.id }
          },
        });
        if (!dataintable) {
          throw new BaseError(BaseResultCode.B002, "No data found in the table.")
        }
        let new_data = Object.assign(dataintable, input);

        if (new_data.file) {
          let pathfile = await this._filehelper.upload(
            new_data.public ? 'public' : 'private',
            new_data.file,
          );
          if (pathfile) {
            new_data.url = pathfile;
          }
        }
        let properties = [];
        // if (input.properties) {
        //   properties = await this.propertyRepository.find({
        //     where: {
        //       id: In(new_data.properties.map((p) => p.id)),
        //     },
        //   });
        //   //console.log(property);
        //   let connect = await this.valueobjectRepository.find({
        //     relations: {
        //       property: true,
        //     },
        //     where: {
        //       //property: In(property.map(({ id }) => id)),
        //       object: {
        //         id: new_data.id,
        //       },
        //     },
        //   });
        //   await this.updateProperties(properties, connect, new_data);
        // }
        let beforedata = null;
        if (new_data.id) {
          beforedata = await this._repository.findOneBy({ id: new_data.id });
        }
        if (beforedata) {
          if (new_data.file && new_data.url && beforedata.url != new_data.url) {
            this._filehelper.delete(beforedata.url);
          } else if (beforedata.public != new_data.public) {
            let filename = this._filehelper.getFileName(beforedata.url, true);
            let afterurl = this._filehelper.joinpath(
              Variable.FORDER_FILE,
              new_data.public
                ? Variable.FORDER_FILE_PUBLIC
                : Variable.FORDER_FILE_PRIVATE,
              filename,
            );
            let befoerurl = beforedata.url;
            if (beforedata.public) {
              befoerurl = this._filehelper.joinpath(
                Variable.FORDER_FILE,
                befoerurl,
              );
            }
            let statuscopy = await this._filehelper.copy(
              befoerurl,
              afterurl,
              true,
            );
            if (statuscopy) {
              new_data.url = afterurl;
            } else {
              new_data.public = beforedata.public;
            }
          }
        }
        if (new_data.public && new_data.url) {
          new_data.url = new_data.url.replace(Variable.FORDER_FILE, String());
        }
        new_data.url = this._filehelper.parseUrl(new_data.url)
        let afterdata = await this._repository.save(new_data);
        // afterdata.properties = properties;
        afterdata.user = autho.user
        return afterdata

  }

  private async createData(input: BaseMedia, autho: AuthContentDocument): Promise<BaseMedia> {
    if (input.file) {
      let pathfile = await this._filehelper.upload(
        input.public ? 'public' : 'private',
        input.file,
      );
      if (pathfile) {
        pathfile = this._filehelper.parseUrl(pathfile)
        // input.url = pathfile;
        // if (input.public) {
        //   input.url = pathfile.replace(MediaConfig.FORDER_FILE, String());
        // }
        input.url = pathfile.replace(Variable.FORDER_FILE, String());
      }
    }
    input.user = autho.user;
    input.document = BaseDocument.create(autho.document.id)
    let media = await this._repository.save(input);
    // if (input.properties) {
    //   let properties = await this.propertyRepository.find({
    //     where: {
    //       id: In(input.properties.map((item) => item.id)),
    //     },
    //   });
    //   await this.updateProperties(properties, [], media);
    //   media.properties = properties;
    // }
    return media;
  }

  // async updateProperties(
  //   properties: PropertyBase[],
  //   connect: ValueMedia[],
  //   media: BaseMedia,
  //   lang: string = String(),
  // ) {
  //   let join = handleUpdateJoinTable<ValueMedia, PropertyBase>(
  //     properties,
  //     connect,
  //     (item, properties, index) => {
  //       return item.property && item.property.id && index < properties.length;
  //     },
  //     (item, property) => {
  //       item.property.id = property.id;
  //       item.lang = lang;
  //       item.object = media;
  //     },
  //     (property: any) => {
  //       let value = new ValueMedia();
  //       value.property = property;
  //       value.lang = lang;
  //       value.object = media;
  //       return value;
  //     },
  //   );
  //   let rowdata = join.create_item.concat(join.update_item);
  //   await this.valueobjectRepository.save(rowdata);

  //   if (join.delete_item.length > 0) {
  //     await this.valueobjectRepository.remove(join.delete_item);
  //   }
  //   return join;
  // }

  async delete(autho: AuthContentDocument, id: string, softDelete = true): Promise<boolean> {

        let data = null;
        if (softDelete) {
          data = await this._repository.softDelete({
            id: id,
            document: { id: autho.document.id },
          });
        } else {
          data = await this._repository.delete({
            id: id,
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
      id: id,
      document: { id: autho.document.id },
    });
    if (data.affected <= 0) {
      return false
    }
    return true
  }
}