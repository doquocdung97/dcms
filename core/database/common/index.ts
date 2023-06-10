import { DataSource } from 'typeorm';

// import { App } from '../../base';

export enum TypeProperty {
}

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
    name = name.toUpperCase();
    TypeProperty[name] = name;
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
  constructor() { }
  get(object: any) {
    let val = null;
    if (object.connectStandard && object.connectStandard.length > 0) {
      val = object.connectStandard[0].value;
    }
    try {
      val = JSON.parse(val)
      if (this.validate(val)) {
        return val
      }
    } catch (error) { }
    return null
  }
  validate(val: any): boolean {
    return true
  }

  async set(object: any, dataSource: DataSource): Promise<any> {
    var val = object.value;
    if (this.validate(val)) {
      const { ValueStandard } = await import('../models/ValueStandard')
      const queryRunner = dataSource.createQueryRunner();
      let connectRepository = queryRunner.manager.getRepository(ValueStandard);

      let connect = await connectRepository.findOne({
        relations: {
          property: true,
        },
        where: {
          property: {
            id: object.id,
          },
        },
      });
      if (!connect) {
        connect = new ValueStandard()
        connect.property = object
      }
      connect.value = JSON.stringify(val)
      await connectRepository.save(connect)
      return val;
    }
    return null
  }
  async setData(object: any, dataSource: DataSource): Promise<any> {
    var val = object.value;
    if (this.validate(val)) {
      let data = await this.set(object, dataSource)
      return data
    }
    return null
  }
}

export enum BaseResultCode {
  B000,
  B001,
  B002,
  B003,
  B004,
}