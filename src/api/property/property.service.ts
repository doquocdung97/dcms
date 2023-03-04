import { Injectable, Inject } from '@nestjs/common';
import {
  In,
  Repository,
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerHelper, Authorization, TypeFunction } from 'core/common';
import { BaseResult, BaseResultCode } from 'src/graphql';
import { PropertyResult, PropertiesResult } from 'src/graphql/property/schema';
import {
  ValueObject,
  PropertyBase,
  BaseMedia,
  ObjectBase,
  User,
  BaseDocument,
} from 'core/database';
import { MainProperty } from 'core/database/common';
import { REQUEST } from '@nestjs/core';

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
    @Inject(REQUEST)
    private request,
  ) {}
  async create(id: string, data: PropertyBase): Promise<PropertyResult> {
    let result = new PropertyResult();
    let user = User.getByRequest(this.request);
    await Authorization(
      user,
      TypeFunction.CREATE,
      async (autho) => {
        let obj = await this.objectRepository.findOneBy({
          id: id,
          document: { id: autho.document.id },
        });
        if (obj) {
          data.parent = obj;
          let record = await this.propertyRepository.save(data);
          result.data = record;
        } else {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      },
      async (ex) => {
        this.logger.error(`Create failed.\n${ex}`);
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    return result;
  }
  async creates(id: string, items: PropertyBase[]): Promise<PropertiesResult> {
    let result = new PropertiesResult();
    let user = User.getByRequest(this.request);
    await Authorization(
      user,
      TypeFunction.CREATE,
      async (autho) => {
        let obj = await this.objectRepository.findOneBy({
          id: id,
          document: { id: autho.document.id },
        });
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
      },
      async (ex) => {
        this.logger.error(`Creates failed.\n${ex}`);
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    return result;
  }
  async update(item: PropertyBase): Promise<PropertyResult> {
    let result = new PropertyResult();
    let user = User.getByRequest(this.request);
    await Authorization(
      user,
      TypeFunction.EDIT,
      async (autho) => {
        var record = await this.propertyRepository.findOne({
          relations: {
            parent: true,
          },
          where: {
            id: item.id,
            parent: { document: { id: autho.document.id } },
          },
        });
        if (
          record &&
          (!item.type || new MainProperty().checkType(item.type.toString()))
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
      },
      async (ex) => {
        this.logger.error(`Update failed.\n${ex}`);
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    return result;
  }
  async get(id: number = null) {
    let user = User.getByRequest(this.request);

    return await Authorization(
      user,
      TypeFunction.QUERY,
      async (autho) => {
        let option: FindManyOptions<PropertyBase> = {
          relations: {
            parent: {
              document: true,
            },
            connectObject: true,
            connectMeida: true,
          },
          where: {
            id: id,
            parent: {
              document: {
                id: autho.document.id,
              },
            },
          },
        };
        if (id) {
          return await this.propertyRepository.findOne(option);
        }
        option.where = {
          parent: {
            document: {
              id: autho.document.id,
            },
          },
        };
        return await this.propertyRepository.find(option);
      },
      async (ex) => {
        this.logger.error(`Get failed.\n${ex}`);
      },
    );
  }
  async delete(id: number, softDelete = true): Promise<BaseResult> {
    let result = new BaseResult();
    let user = User.getByRequest(this.request);
    await Authorization(
      user,
      TypeFunction.DELETE,
      async (autho) => {
        let data = null;
        let option: FindOptionsWhere<PropertyBase> = {
          id: id,
          parent: { document: { id: autho.document.id } },
        };
        if (softDelete) {
          data = await this.propertyRepository.softDelete(option);
        } else {
          data = await this.propertyRepository.delete(option);
        }
        if (data && data.affected <= 0) {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      },
      async (ex) => {
        this.logger.error(`Delete failed.\n${ex}`);
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    return result;
  }
  async restore(id: number): Promise<BaseResult> {
    let result = new BaseResult();
    let user = User.getByRequest(this.request);
    await Authorization(
      user,
      TypeFunction.DELETE,
      async (autho) => {
        let data = await this.propertyRepository.restore({
          id: id,
          parent: { document: { id: autho.document.id } },
        });
        if (data.affected <= 0) {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      },
      async (ex) => {
        this.logger.error(`Delete failed.\n${ex}`);
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    return result;
  }
  getRepository() {
    return this.propertyRepository;
  }
}
