import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
import { PropertyService } from '../property/property.service';
import { PropertyBase, ValueMedia, BaseMedia, User } from 'core/database';
import { FileHelper, handleUpdateJoinTable, LoggerHelper } from 'core/common';
import { Config, MediaConfig } from 'src/constants';
import { REQUEST } from '@nestjs/core';
import { BaseResult, BaseResultCode } from 'src/graphql';
interface InputMedia {
  id: string;
  name: string;
  public: boolean;
  file: any;
  properties: number[];
}
import { MediaResult, MediasResult } from 'src/graphql/media/schema';
@Injectable()
export class MediaService {
  private filehelper = new FileHelper();
  private logger = new LoggerHelper('MediaService');
  constructor(
    @Inject(REQUEST)
    private request,
    @InjectRepository(BaseMedia)
    private mediaRepository: Repository<BaseMedia>,
    private propertyService: PropertyService,
    @InjectRepository(ValueMedia)
    private valueobjectRepository: Repository<ValueMedia>,
  ) {}
  async create(input: BaseMedia): Promise<MediaResult> {
    //input.validate()
    let result = new MediaResult();
    try {
      if (input.file) {
        let pathfile = await this.filehelper.upload(
          input.public ? 'public' : 'private',
          input.file,
        );
        if (pathfile) {
          input.url = pathfile;
          if (input.public) {
            input.url = pathfile.replace(MediaConfig.FORDER_FILE, String());
          }
        }
      }
      input.user = User.getByRequest(this.request);
      let media = await this.mediaRepository.save(input);
      if (input.properties) {
        let propertyRepository = this.propertyService.getRepository();
        let properties = await propertyRepository.find({
          where: {
            id: In(input.properties.map((item) => item.id)),
          },
        });
        await this.updateProperties(properties, [], media);
        media.properties = properties;
      }
      result.data = media;
    } catch (ex) {
      this.logger.error(`Create failure.\n${ex}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result;
  }
  private async createData(input: BaseMedia): Promise<BaseMedia> {
    try {
      if (input.file) {
        let pathfile = await this.filehelper.upload(
          input.public ? 'public' : 'private',
          input.file,
        );
        if (pathfile) {
          input.url = pathfile;
          if (input.public) {
            input.url = pathfile.replace(MediaConfig.FORDER_FILE, String());
          }
        }
      }
      input.user = User.getByRequest(this.request);
      let media = await this.mediaRepository.save(input);
      if (input.properties) {
        let propertyRepository = this.propertyService.getRepository();
        let properties = await propertyRepository.find({
          where: {
            id: In(input.properties.map((item) => item.id)),
          },
        });
        await this.updateProperties(properties, [], media);
        media.properties = properties;
      }
      return media;
    } catch (ex) {
      this.logger.error(`Create data failed.\n${ex}`);
    }
  }
  async creates(inputs: BaseMedia[]): Promise<MediasResult> {
    //input.validate()
    let result = new MediasResult();
    try {
      let medias = [];
      for (let index = 0; index < inputs.length; index++) {
        const input = inputs[index];
        let media = await this.createData(input);
        medias.push(media);
      }
      result.data = medias;
    } catch (ex) {
      this.logger.error(`Create many failures.\n${ex}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result;
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
  async update(input: BaseMedia): Promise<MediaResult> {
    let result = new MediaResult();
    try {
      let dataintable = await this.mediaRepository.findOne({
        where: { id: input.id },
      });
      if (!dataintable) {
        result.success = false;
        result.code = BaseResultCode.B002;
        return result;
      }
      let new_data = Object.assign(dataintable, input);

      if (new_data.file) {
        let pathfile = await this.filehelper.upload(
          new_data.public ? 'public' : 'private',
          new_data.file,
        );
        if (pathfile) {
          new_data.url = pathfile;
        }
      }
      let properties = [];
      if (input.properties) {
        let propertyRepository = this.propertyService.getRepository();
        properties = await propertyRepository.find({
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
        beforedata = await this.mediaRepository.findOneBy({ id: new_data.id });
      }
      if (beforedata) {
        if (new_data.file && new_data.url && beforedata.url != new_data.url) {
          this.filehelper.delete(beforedata.url);
        } else if (beforedata.public != new_data.public) {
          let filename = this.filehelper.getFileName(beforedata.url, true);
          let afterurl = this.filehelper.joinpath(
            MediaConfig.FORDER_FILE,
            new_data.public
              ? MediaConfig.FORDER_FILE_PUBLIC
              : MediaConfig.FORDER_FILE_PRIVATE,
            filename,
          );
          let befoerurl = beforedata.url;
          if (beforedata.public) {
            befoerurl = this.filehelper.joinpath(
              MediaConfig.FORDER_FILE,
              befoerurl,
            );
          }
          let statuscopy = await this.filehelper.copy(
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
      let afterdata = await this.mediaRepository.save(new_data);
      afterdata.properties = properties;
      result.data = afterdata;
    } catch (error) {
      this.logger.error(`Update failures.\n${error}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result;
  }

  async get(data: any = {}) {
    let user = User.getByRequest(this.request);
    let option: FindManyOptions<BaseMedia> = {
      where: {
        user: {
          id: user.id,
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
      option.where = {
        user: {
          id: user.id,
        },
        id: data.id,
      };
      return await this.mediaRepository.findOne(option);
    }
    return await this.mediaRepository.find(option);
  }
  async getByUrl(url: string) {
    return await this.mediaRepository.findOne({
      where: { url: url },
      relations: {
        user: true,
      },
    });
  }
  async delete(id: string, softDelete = true): Promise<BaseResult> {
    let result = new BaseResult();

    try {
      let user = User.getByRequest(this.request);
      if (softDelete) {
        let data = await this.mediaRepository.softDelete({
          id: id,
          user: { id: user.id },
        });
        if (data.affected <= 0) {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      } else {
        let data = await this.mediaRepository.delete({
          id: id,
          user: { id: user.id },
        });
        if (data.affected <= 0) {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      }
    } catch (ex) {
      this.logger.error(`Delete failed.\n${ex}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result;
  }
  async restore(id: string): Promise<BaseResult> {
    let result = new BaseResult();
    try {
      let user = User.getByRequest(this.request);
      let data = await this.mediaRepository.restore({
        id: id,
        user: { id: user.id },
      });
      if (data.affected <= 0) {
        result.success = false;
        result.code = BaseResultCode.B002;
      }
    } catch (ex) {
      this.logger.error(`Restore failed.\n${ex}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result;
  }
}
