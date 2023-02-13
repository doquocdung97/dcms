import { DataSource } from 'typeorm';

class _MainProperty {
  private properties = {};
  constructor() {}
  addProperty(name: string, property: any) {
    this.properties[name] = new property();
  }
  getTypes() {
    return Object.keys(this.properties);
  }
  getDefault() {
    return Object.keys(this.properties)[0];
  }
  checkType(name: string) {
    return this.properties[name.toLowerCase()] ? true : false;
  }
  get(name: any): BasePropertyType {
    return this.properties[name.toLowerCase()];
  }
  gets() {
    return this.properties;
  }
}

export const MainProperty = new _MainProperty();

export class BasePropertyType {
  dataInTable: boolean = true;
  constructor() {}
  async set(object: any, dataSource: DataSource) {
    if (!object.attribute) {
      object.attribute = new Object();
    }
    var val = object.value;
    object.attribute['value'] = val;
    return val;
  }
  get(object: any): any {
    if (object.attribute) {
      return object.attribute['value'];
    }
  }
}

export enum TypeProperty {}
