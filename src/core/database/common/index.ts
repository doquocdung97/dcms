import { DataSource } from 'typeorm';

/**
 * Design Pattern
 * Creational Pattern - Builder Pattern
 */
/**
 * Design Pattern
 * Structural Pattern - Composite Pattern
 * Composite class
 */
class _MainProperty {
  /**
 * Design Pattern
 * Creational Pattern - Singleton Pattern
 */
  private static instance: _MainProperty;
  private properties = {};
  constructor() {
    const instance = _MainProperty.instance;
    if (instance) {
      return instance;
    }
    _MainProperty.instance = this;
  }
  public static getInstance(): _MainProperty {
    if (!_MainProperty.instance) {
      _MainProperty.instance = new _MainProperty();
    }
    return _MainProperty.instance;
  }

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
  /**
   * Design Pattern:
   * Creational Pattern - Factory Method
   */
  get(name: any): BasePropertyType {
    return this.properties[name.toLowerCase()];
  }
  gets() {
    return this.properties;
  }
}

export const MainProperty = new _MainProperty();

/**
 * Design Pattern
 * Structural Pattern - Composite Pattern
 * Component interface
 */
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
