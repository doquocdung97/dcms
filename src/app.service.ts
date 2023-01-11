import { Injectable } from '@nestjs/common';
import { Repository, FindManyOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import ObjectBase from './database/models/ObjectBase';
import {
  PropertyService,
  ValueObjectService,
} from './property/property.service';
import PropertyBase from './database/models/Property';
import ValueObject from './database/models/ValueObject';
@Injectable()
export class AppService {
  constructor(
    @InjectRepository(ObjectBase)
    private objectRepository: Repository<ObjectBase>,
    private readonly propertyService: PropertyService,
    private readonly valueobjectService: ValueObjectService,
  ) {}
  async create(test: any) {
    let objs = [];
    for (let i = 0; i < 10; i++) {
      let a = new ObjectBase();
      a.name = test.name + ' ' + i;
      objs.push(a);
    }

    await this.objectRepository.save(objs);

    let main = new ObjectBase();
    main.name = 'child test';
    main.children = objs;
    let properties = [];
    for (let i = 0; i < 10; i++) {
      let property = new PropertyBase();
      property.name = `property ${i}`;
      properties.push(property);
    }
    await this.propertyService.saves(properties);
    let valueobjects = [];
    for (let i = 0; i < 5; i++) {
      let valueobject = new ValueObject();
      valueobject.object = objs[i];
      valueobject.property = properties[0];
      valueobjects.push(valueobject);
    }
    this.valueobjectService.saves(valueobjects);
    main.properties = properties;
    await this.objectRepository.save(main);
    return main;
  }
  async get(id: string = String()) {
    let option: FindManyOptions<ObjectBase> = {
      relations: {
        children: {
          connect: true,
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
  getHello(): string {
    return 'Hello World!';
  }
}
