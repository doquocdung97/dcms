import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
import { PropertyService } from 'src/property/property.service';
import { PropertyBase, ValueMedia, BaseMedia, User } from 'core/database';
import { FileHelper, handleUpdateJoinTable, LoggerHelper } from 'core/common';
import { Config, MediaConfig } from 'src/Constants';
import { REQUEST } from '@nestjs/core';
import { BaseResult, BaseResultCode } from 'core/graphql';
interface InputMedia {
  id: string;
  name: string;
  public: boolean;
  file: any;
  properties: number[];
}
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
  async save(inputdata: InputMedia) {
    try {
      let new_data = Object.assign(new BaseMedia(), inputdata);

      if (new_data.file) {
        let pathfile = this.filehelper.upload(
          new_data.public ? 'public' : 'private',
          new_data.file,
        );
        if (pathfile) {
          new_data.url = pathfile;
        }
      }
      delete new_data['file'];
      let data: BaseMedia = new_data;
      this.logger.info(`Save input: ${JSON.stringify(data)}`);
      if (inputdata.properties) {
        let propertyRepository = this.propertyService.getRepository();
        let property = await propertyRepository.find({
          where: {
            id: In(data.properties),
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
              id: data.id,
            },
          },
        });
        let join = handleUpdateJoinTable<ValueMedia, PropertyBase>(
          property,
          connect,
          (item, properties, index) => {
            return (
              item['property'] &&
              item['property']['id'] &&
              index < properties.length
            );
          },
          (item, property) => {
            item.property.id = property.id;
            item.object = data;
          },
          (property: any) => {
            let newvalue = new ValueMedia();
            newvalue.property = property;
            newvalue.lang = String();
            newvalue.object = data;
            return newvalue;
          },
        );
        let rowdata = join.create_item.concat(join.update_item);
        this.valueobjectRepository.save(rowdata);

        if (join.delete_item.length > 0) {
          this.valueobjectRepository.remove(join.delete_item);
        }
      }
      let beforedata = null;
      if (data.id) {
        beforedata = await this.mediaRepository.findOneBy({ id: data.id });
      }
      if (beforedata) {
        if (new_data.file && data.url && beforedata.url != data.url) {
          this.filehelper.delete(beforedata.url);
        } else if (beforedata.public != data.public) {
          let filename = this.filehelper.getFileName(beforedata.url, true);
          let afterurl = this.filehelper.joinpath(
            MediaConfig.FORDER_FILE,
            data.public
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
            data.url = afterurl;
          } else {
            data.public = beforedata.public;
          }
        }
      }
      if (data.public && data.url) {
        data.url = data.url.replace(MediaConfig.FORDER_FILE, String());
      }
      data.user = this.request.user as User;
      let afterdata = await this.mediaRepository.save(data);

      return afterdata;
    } catch (error) {
      this.logger.error(`Save failed.\n${error}`);
    }
    return null;
  }
  getRepository() {
    return this.mediaRepository;
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
