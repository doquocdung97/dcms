import { Authorization, FileHelper, LoggerHelper, TypeFunction, handleUpdateJoinTable } from "src/core/common";
import { BaseMedia } from "../models/Media";
import { DataSource, FindManyOptions, In, Repository } from "typeorm";
import { AuthContentDocument, BaseDocument, DataBase, PropertyBase, User, ValueMedia } from "..";
import { DatabaseConfig, MediaConfig } from "src/constants";
import { BaseResult, BaseResultCode } from "../common";

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
	private valueobjectRepository: Repository<ValueMedia>;
	private propertyRepository: Repository<PropertyBase>;
	private _request: any;
	constructor(request: any) {
		let data = new DataBase()
		this._dataSource = data.getDataSource(DatabaseConfig.MAIN);
		this._request = request;
		this._repository = this._dataSource.getRepository(BaseMedia);
		this.valueobjectRepository = this._dataSource.getRepository(ValueMedia);
		this.propertyRepository = this._dataSource.getRepository(PropertyBase);
	}

	async get(data: any = {}) {
    let user = User.getByRequest(this._request);
    return await Authorization(user, TypeFunction.QUERY, async (autho) => {
      let option: FindManyOptions<BaseMedia> = {
        where: {
          id: data.id,
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
      if (data.id) {
        return await this._repository.findOne(option);
      }
      return await this._repository.find(option);
    });
  }
	
  async getByUrl(url: string): Promise<BaseMedia> {
    let user = User.getByRequest(this._request);
    return await Authorization(
      user,
      TypeFunction.QUERY,
      async (autho) => {
        let result = await this._repository.findOne({
          where: { 
            url: url ,
            document:{id:autho.document.id}
          },
          relations: {
            user: true,
          },
        });
        return result
      });
    
  }

	async create(input: BaseMedia): Promise<MediaResult> {
    //input.validate()
    let result = new MediaResult();
    let user = User.getByRequest(this._request);
    await Authorization(
      user,
      TypeFunction.CREATE,
      async (autho) => {
        result.data = await this.createData(input, autho);
      },
      (ex) => {
        this._logger.error(`Create failure.\n${ex}`);
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    return result;
  }

	async creates(inputs: BaseMedia[]): Promise<MediasResult> {
    //input.validate()
    let result = new MediasResult();
    let user = User.getByRequest(this._request);
    await Authorization(
      user,
      TypeFunction.CREATE,
      async (autho) => {
        let medias = [];
        for (let index = 0; index < inputs.length; index++) {
          const input = inputs[index];
          let media = await this.createData(input, autho);
          medias.push(media);
        }
        result.data = medias;
      },
      (ex) => {
        this._logger.error(`Create many failures.\n${ex}`);
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    return result;
  }

	async update(input: BaseMedia): Promise<MediaResult> {
    let result = new MediaResult();
    let user = User.getByRequest(this._request);
    await Authorization(
      user,
      TypeFunction.EDIT,
      async (autho) => {
        let dataintable = await this._repository.findOne({
          where: {
            id: input.id,
            document: { id: autho.document.id }
          },
        });
        if (!dataintable) {
          result.success = false;
          result.code = BaseResultCode.B002;
          return result;
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
        if (input.properties) {
          properties = await this.propertyRepository.find({
            where: {
              id: In(new_data.properties.map((p) => p.id)),
            },
          });
          //console.log(property);
          let connect = await this.valueobjectRepository.find({
            relations: {
              property: true,
            },
            where: {
              //property: In(property.map(({ id }) => id)),
              object: {
                id: new_data.id,
              },
            },
          });
          await this.updateProperties(properties, connect, new_data);
        }
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
              MediaConfig.FORDER_FILE,
              new_data.public
                ? MediaConfig.FORDER_FILE_PUBLIC
                : MediaConfig.FORDER_FILE_PRIVATE,
              filename,
            );
            let befoerurl = beforedata.url;
            if (beforedata.public) {
              befoerurl = this._filehelper.joinpath(
                MediaConfig.FORDER_FILE,
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
          new_data.url = new_data.url.replace(MediaConfig.FORDER_FILE, String());
        }
        new_data.url = this._filehelper.parseUrl(new_data.url)
        let afterdata = await this._repository.save(new_data);
        afterdata.properties = properties;
        result.data = afterdata;
      },
      (ex) => {
        this._logger.error(`Update failures.\n${ex}`);
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    return result;
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
        input.url = pathfile.replace(MediaConfig.FORDER_FILE, String());
      }
    }
    input.user = User.getByRequest(this._request);
    input.document = BaseDocument.create(autho.document.id)
    let media = await this._repository.save(input);
    if (input.properties) {
      let properties = await this.propertyRepository.find({
        where: {
          id: In(input.properties.map((item) => item.id)),
        },
      });
      await this.updateProperties(properties, [], media);
      media.properties = properties;
    }
    return media;
  }

	async updateProperties(
    properties: PropertyBase[],
    connect: ValueMedia[],
    media: BaseMedia,
    lang: string = String(),
  ) {
    let join = handleUpdateJoinTable<ValueMedia, PropertyBase>(
      properties,
      connect,
      (item, properties, index) => {
        return item.property && item.property.id && index < properties.length;
      },
      (item, property) => {
        item.property.id = property.id;
        item.lang = lang;
        item.object = media;
      },
      (property: any) => {
        let value = new ValueMedia();
        value.property = property;
        value.lang = lang;
        value.object = media;
        return value;
      },
    );
    let rowdata = join.create_item.concat(join.update_item);
    await this.valueobjectRepository.save(rowdata);

    if (join.delete_item.length > 0) {
      await this.valueobjectRepository.remove(join.delete_item);
    }
    return join;
  }

	async delete(id: string, softDelete = true): Promise<BaseResult> {
    let result = new BaseResult();
    let user = User.getByRequest(this._request);
    await Authorization(
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
            id: id,
            document: { id: autho.document.id },
          });
        }
        if (data && data.affected <= 0) {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      },
      async (ex) => {
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
    await Authorization(
      user,
      TypeFunction.DELETE,
      async (autho) => {
        let data = await this._repository.restore({
          id: id,
          document: { id: autho.document.id },
        });
        if (data.affected <= 0) {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      },
      async (ex) => {
        this._logger.error(`Restore failed.\n${ex}`);
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    return result;
  }
}