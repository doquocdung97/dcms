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
    return this.properties[name] ? true : false;
  }
  get(name: any) {
    return this.properties[name];
  }
  gets() {
    return this.properties;
  }
}

export const MainProperty = new _MainProperty();

export class BasePropertyType {
  constructor() {}
  set(object: any, dataSource: DataSource): void {
    if (!object.attribute) {
      object.attribute = new Object();
    }
    var val = object.value;
    object.attribute['value'] = val;
  }
  get(object: any): any {
    if (object.attribute) {
      return object.attribute['value'];
    }
  }
}
