import { Injectable } from '@nestjs/common';
import { In, Repository, DataSource, FindManyOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ValueObject, PropertyBase, BaseMedia } from 'core/database';
import { MediaService } from 'src/media/media.service';
import { MainProperty } from 'core/database/common';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyBase)
    private propertyRepository: Repository<PropertyBase>,
    @InjectRepository(BaseMedia)
    private mediaRepository: Repository<BaseMedia>, //private readonly mediaService: MediaService,
    private dataSource: DataSource,
  ) {}
  async saves(data: PropertyBase[]): Promise<PropertyBase[]> {
    return await this.propertyRepository.save(data);
  }
  async save(data: PropertyBase): Promise<PropertyBase> {
    return await this.propertyRepository.save(data);
  }
  async create(data: PropertyBase): Promise<PropertyBase> {
    data.attribute = {};
    let record = await this.propertyRepository.save(data);
    return record;
  }

  async update(data: PropertyBase): Promise<PropertyBase> {
    var record = await this.propertyRepository.findOne({
      relations: {
        parent: true,
      },
      where: { id: data.id },
    });
    if (
      record &&
      (!data.type || MainProperty.checkType(data.type.toString()))
    ) {
      let result = Object.assign(record, data);
      result.AfterUpdate(this.dataSource);
      let rowdata = await this.propertyRepository.save(result);
      rowdata.value = result.value;
      return rowdata;
    }
    return null;
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
  async delete(id: number, softDelete = true) {
    if (softDelete) return await this.propertyRepository.softDelete({ id: id });
    else {
      return await this.propertyRepository.delete({ id: id });
    }
  }
  async restore(id: number) {
    return await this.propertyRepository.restore({ id: id });
  }
  getRepository() {
    return this.propertyRepository;
  }
}

@Injectable()
export class ValueObjectService {
  constructor(
    @InjectRepository(ValueObject)
    private valueobjectRepository: Repository<ValueObject>,
  ) {}
  async saves(data: ValueObject[]): Promise<ValueObject[]> {
    return await this.valueobjectRepository.save(data);
  }
  async save(data: ValueObject) {
    return await this.valueobjectRepository.save(data);
  }
}
