import { Injectable } from '@nestjs/common';
import { In, Repository, DataSource } from 'typeorm';
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
  async update(data: PropertyBase): Promise<PropertyBase> {
    var record = await this.propertyRepository.findOne({
      relations: {
        parent: true,
      },
      where: { id: data.id },
    });
    if (record && (!data.type || MainProperty.checkType(data.type))) {
      let result = Object.assign(record, data);
      //let a = await this.mediaRepository.find({
      //  where: { id: In(data.value) },
      //});
      //console.log(MainProperty.get(data.type));
      //console.log(a);
      result.AfterUpdate(this.dataSource);
      record = this.propertyRepository.create(result);
      return await this.propertyRepository.save(record);
    }
    return null;
  }
  async get(data: any) {
    if (data.id) {
      return await this.propertyRepository.findOneBy({ id: data.id });
    }
    return await this.propertyRepository.find({
      relations: {
        connectObject: true,
        connectMeida: true,
      },
    });
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
