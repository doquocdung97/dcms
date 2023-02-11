import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { ObjectBase, PropertyBase, ValueObject } from 'core/database';
import { LoggerHelper } from 'core/common';
import { ObjectResult, ResultCode } from 'core/graphql/object';
import { BaseResult, BaseResultCode } from 'core/graphql';
import { PropertyService } from 'src/property/property.service';

@Injectable()
export class ObjectService {
  private logger = new LoggerHelper('ObjectService');
  constructor(
    @InjectRepository(ObjectBase)
    private objectRepository: Repository<ObjectBase>,
    private readonly propertyService: PropertyService,
  ) {}
  async create(obj: ObjectBase): Promise<ObjectResult> {
    let result = new ObjectResult();
    try {
      let data = await this.objectRepository.save(obj);
      if (data) {
        let record = await this.propertyService.creates(
          data.id,
          data.properties,
        );
        if (record.success) {
          data.properties = record.data;
        }
      }
      result.data = data;
    } catch (ex) {
      this.logger.error(
        `Create failed.\nWith info:\n${JSON.stringify(obj)}.\n${ex}`,
      );
      result.success = false;
      result.code = ResultCode.B001;
    }
    return result;
  }
  async get(id: string = String()) {
    let option: FindManyOptions<ObjectBase> = {
      relations: {
        children: {
          connect: true,
          properties: {
            connectObject: {
              object: true,
            },
            connectMeida: {
              object: true,
            },
          },
        },
        properties: {
          connectObject: {
            object: true,
          },
          connectMeida: {
            object: true,
          },
        },
      },
      select: {
        name: false,
      },
    };
    if (id) {
      option.where = {
        id: id,
      };
      let data = await this.objectRepository.findOne(option);
      return data;
    }
    let data = await this.objectRepository.find(option);
    return data;
  }
  async delete(id: string, softDelete = true): Promise<BaseResult> {
    let result = new BaseResult();
    try {
      if (softDelete) {
        let data = await this.objectRepository.softDelete({ id: id });
        if (data.affected <= 0) {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      } else {
        let data = await this.objectRepository.delete({ id: id });
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
      let data = await this.objectRepository.restore({ id: id });
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
