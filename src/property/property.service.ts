import { Injectable } from '@nestjs/common';
import PropertyBase, { MainProperty } from 'src/database/models/Property';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import ValueObject from 'src/database/models/ValueObject';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyBase)
    private propertyRepository: Repository<PropertyBase>,
  ) {}
  async saves(data: PropertyBase[]): Promise<PropertyBase[]> {
    return await this.propertyRepository.save(data);
  }
  async save(data: PropertyBase): Promise<PropertyBase> {
    return await this.propertyRepository.save(data);
  }
  async update(data: PropertyBase): Promise<PropertyBase> {
    var record = await this.propertyRepository.findOne({
      where: { id: data.id },
    });
    if (record && (!data.type || MainProperty.checkType(data.type))) {
      let result = Object.assign(record, data);
      result.AfterUpdate();
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
