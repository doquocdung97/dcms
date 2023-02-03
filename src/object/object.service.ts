import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { ObjectBase, PropertyBase, ValueObject } from 'core/database';
import {
  PropertyService,
  ValueObjectService,
} from 'src/property/property.service';

@Injectable()
export class ObjectService {
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
}
