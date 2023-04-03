import { Inject, Injectable } from '@nestjs/common';
import { DataBase, ObjectBase, PropertyBase, TypeProperty } from './core/database';
import { join, basename, extname, dirname } from 'path';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  unlinkSync,
  copyFileSync,
  readFileSync,
  readFile
} from 'fs';
import ObjectRepository from './core/database/repository/ObjectRepository';
import { REQUEST } from '@nestjs/core';
import PropertyRepository from './core/database/repository/PropertyRepository';
import { VariableMain } from './constants';
import { handleUpdateJoinTable } from './core/common';
@Injectable()
export class AppService {
  object: ObjectRepository
  property: PropertyRepository
  constructor(
    @Inject(REQUEST)
    private request,
  ) {
    new DataBase()
    this.object = new ObjectRepository(request)
    this.property = new PropertyRepository(request)
  }
  // async get() {
  //   new DataBase()
  //   let path = join(__dirname, '..', 'src/mod')
  //   let fullname = join(path, 'Blog', 'schema.json')
  //   let rawdata = readFileSync(fullname);
  //   // await readFile(rawdata, (err, data) => {
  //   //   if (err) throw err;
  //   //   let student = JSON.parse(data.toString());
  //   //   console.log(student);
  //   // });
  //   let schema = JSON.parse(rawdata.toString());
  //   return schema
  // }
  async create() {

  }
  async update(name, data) {
    let path = join(__dirname, '..', 'src/mod')
    let fullname = join(path, name, 'schema.json')
    let rawdata = readFileSync(fullname);
    let schema = JSON.parse(rawdata.toString());
    let propertys = parseDataUpdate(schema, data)
    return await this.property.updates(data.id, propertys)
  }
  async get(name) {
    let path = join(__dirname, '..', 'src/mod')
    let fullname = join(path, name, 'schema.json')
    let rawdata = readFileSync(fullname);
    let schema = JSON.parse(rawdata.toString());
    if (schema.type == VariableMain.DICT) {
      let data = await this.object.getByName(schema.name)
      return parseData(schema, data)
    }
    return null
  }
  async generate(name) {
    let path = join(__dirname, '..', 'src/mod')
    let fullname = join(path, name, 'schema.json')
    if (existsSync(fullname)) {
      let rawdata = readFileSync(fullname);
      let schema = JSON.parse(rawdata.toString());
      return generate(schema, this.object, this.property)
    }

  }
}
class GenerateTemplate {
  private _name: string;
  constructor(name) {

  }
  private getSchame(): ObjectClient {
    let path = join(__dirname, '..', 'src/mod')
    let fullname = join(path, this._name, 'schema.json')
    let rawdata = readFileSync(fullname);
    let schema = JSON.parse(rawdata.toString());
    return schema as ObjectClient;
  }
  create() {

  }
  get() {

  }
  update() {

  }
  delete() {

  }
  excute() {

  }
}
async function generate(schema: ObjectClient, objectRepository: ObjectRepository, propertyRepository: PropertyRepository) {
  if (schema.type == VariableMain.DICT) {
    let object = await objectRepository.getByName(schema.name);
    if (!object) {
      //create
      let obj = new ObjectBase();
      obj.name = schema.name;
      obj.type = schema.type;
      let properties: PropertyBase[] = []
      schema.fields.map((item: FieldClient, index) => {
        let property = new PropertyBase();
        property.name = item.name;
        property.type = TypeProperty[item.type.toUpperCase()];
        property.value = null;
        properties.push(property)
      })
      obj.properties = properties;

      let result = await objectRepository.create(null, obj);
      if (result.success) {
        object = result.data;
      } else {
        return result;
      }
    } else {
      //update
      let join = handleUpdateJoinTable<PropertyBase, FieldClient>(
        schema.fields,
        object.properties,
        (item, properties, index) => {
          return item && item.type && index < properties.length;
        },
        (property: PropertyBase, field: FieldClient) => {
          property.name = field.name;
          property.max = field.option?.max;
          property.min = field.option?.min;
          property.type = TypeProperty[field.type.toUpperCase()];
        },
        (field: FieldClient) => {
          let property = new PropertyBase();
          property.name = field.name;
          property.max = field.option?.max;
          property.min = field.option?.min;
          property.type = TypeProperty[field.type.toUpperCase()];
          property.value = null;
          return property;
        },
      );
      await propertyRepository.creates(object.id, join.create_item);
      await propertyRepository.updates(object.id, join.update_item);
      await propertyRepository.deletes(join.delete_item?.map(item => item.id));
      return join
    }
    return object;
  }
  return schema;
}
function parseData(schema, data) {
  let attributes = {}
  schema.fields.map((item: FieldClient) => {
    let property = data.properties.find(x => x.name == item.name)
    if (property) {
      attributes[item.name] = property.value
    }
  })
  return {
    id: data.id,
    attributes: attributes
  }

}
function parseDataUpdate(schema, data) {
  let propertys: PropertyBase[] = []
  schema.fields.map(item => {
    if (item != undefined) {
      let property = new PropertyBase();
      property.name = item.name;
      property.value = data.attributes[item.name]
      propertys.push(property)
    }
  })
  return propertys
}

class OptionClient {
  max: number;
  min: number;
  map: string;
}

class FieldClient {
  name: string;
  required: boolean;
  manylang: boolean;
  type: string;
  option: OptionClient;
  default: any;
}
class ObjectClient {
  name: string;
  type: string;
  fields: FieldClient[];
}
