import { Injectable } from '@nestjs/common';
import { In, Repository, DataSource, FindManyOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerHelper } from 'core/common';
import { BaseResult, BaseResultCode } from 'src/graphql';
import { PropertyResult, PropertiesResult } from 'src/graphql/property/schema';
import {
  ValueObject,
  PropertyBase,
  BaseMedia,
  ObjectBase,
} from 'core/database';
import { MainProperty } from 'core/database/common';

@Injectable()
export class PropertyService {
  private logger = new LoggerHelper('PropertyService');
  constructor(
    @InjectRepository(PropertyBase)
    private propertyRepository: Repository<PropertyBase>,
    @InjectRepository(BaseMedia)
    private mediaRepository: Repository<BaseMedia>, //private readonly mediaService: MediaService,
    @InjectRepository(ObjectBase)
    private objectRepository: Repository<ObjectBase>,
    private dataSource: DataSource,
  ) {}
  async create(id: string, data: PropertyBase): Promise<PropertyResult> {
    let result = new PropertyResult();
    try {
      let obj = await this.objectRepository.findOneBy({ id: id });
      if (obj) {
        data.parent = obj;
        let record = await this.propertyRepository.save(data);
        result.data = record;
      } else {
        result.success = false;
        result.code = BaseResultCode.B002;
      }
    } catch (ex) {
      this.logger.error(`Create failed.\n${ex}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result;
  }
  async creates(id: string, items: PropertyBase[]): Promise<PropertiesResult> {
    let result = new PropertiesResult();
    try {
      let obj = await this.objectRepository.findOneBy({ id: id });
      if (obj) {
        items.map((data) => {
          data.parent = obj;
        });
        let record = await this.propertyRepository.save(items);
        result.data = record;
      } else {
        result.success = false;
        result.code = BaseResultCode.B002;
      }
    } catch (ex) {
      this.logger.error(`Creates failed.\n${ex}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    }

    return result;
  }
  async update(item: PropertyBase): Promise<PropertyResult> {
    let result = new PropertyResult();
    try {
      var record = await this.propertyRepository.findOne({
        relations: {
          parent: true,
        },
        where: { id: item.id },
      });
      if (
        record &&
        (!item.type || MainProperty.checkType(item.type.toString()))
      ) {
        let data = Object.assign(record, item);
        data.AfterUpdate(this.dataSource);
        let rowdata = await this.propertyRepository.save(data);
        rowdata.value = data.value;
        result.data = rowdata;
      } else {
        result.success = false;
        result.code = BaseResultCode.B002;
      }
    } catch (ex) {
      this.logger.error(`Update failed.\n${ex}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result;
  }
  async get(data: any = {}) {
    let option: FindManyOptions<PropertyBase> = {
      relations: {
        connectObject: {
          object: true,
        },
        connectMeida: {
          object: true,
        },
      },
    };
    if (data.id) {
      option.where = {
        id: data.id,
      };
      return await this.propertyRepository.findOne(option);
    }
    return await this.propertyRepository.find(option);
  }
  async delete(id: number, softDelete = true): Promise<BaseResult> {
    let result = new BaseResult();
    try {
      if (softDelete) {
        let data = await this.propertyRepository.softDelete({ id: id });
        if (data.affected <= 0) {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      } else {
        let data = await this.propertyRepository.delete({ id: id });
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
  async restore(id: number): Promise<BaseResult> {
    let result = new BaseResult();
    try {
      let data = await this.propertyRepository.restore({ id: id });
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
  getRepository() {
    return this.propertyRepository;
  }
}
