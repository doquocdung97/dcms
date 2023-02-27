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
export class MainProperty {
  /**
 * Design Pattern
 * Creational Pattern - Singleton Pattern
 */
  private static instance: MainProperty;
  private properties = {};
  constructor() {
    const instance = MainProperty.instance;
    if (instance) {
      return instance;
    }
    MainProperty.instance = this;
  }
  public static getInstance(): MainProperty {
    if (!MainProperty.instance) {
      MainProperty.instance = new MainProperty();
    }
    return MainProperty.instance;
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
