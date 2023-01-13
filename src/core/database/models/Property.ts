import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  AfterLoad,
  ManyToOne,
  OneToMany,
  BeforeUpdate,
  AfterUpdate,
} from 'typeorm';
import { ObjectBase } from './ObjectBase';
import { ValueObject } from './ValueObject';
import { ValueMedia } from './ValueMedia';

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
    console.log('checkType', name, this.properties[name]);
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
  set(object: PropertyBase): void {
    if (!object.attribute) {
      object.attribute = new Object();
    }
    var val = object.value;
    object.attribute['value'] = val;
  }
  get(object: PropertyBase): any {
    if (object.attribute) {
      return object.attribute['value'];
    }
  }
}

class PropertyString extends BasePropertyType {
  get(object: PropertyBase) {
    return super.get(object) || String();
  }
}
MainProperty.addProperty('string', PropertyString);

class PropertyStrings extends BasePropertyType {
  get(object: PropertyBase) {
    return super.get(object) || [];
  }
}
MainProperty.addProperty('strings', PropertyStrings);

class PropertyNumber extends BasePropertyType {
  get(object: PropertyBase) {
    return super.get(object) || 0;
  }
}
MainProperty.addProperty('number', PropertyNumber);

class PropertyNumbers extends BasePropertyType {
  get(object: PropertyBase) {
    return super.get(object) || [];
  }
}
MainProperty.addProperty('numbers', PropertyNumbers);

class PropertyJson extends BasePropertyType {
  get(object: PropertyBase) {
    return super.get(object) || {};
  }
}
MainProperty.addProperty('json', PropertyJson);

class PropertyRelationship extends BasePropertyType {
  set(object: PropertyBase) {
    super.set(object);
  }
  get(object: PropertyBase) {
    let val = null;
    if (object.connectObject && object.connectObject.length > 0) {
      val = object.connectObject[0].object;
    }
    return val;
  }
}
MainProperty.addProperty('relationship', PropertyRelationship);

class PropertyRelationships extends BasePropertyType {
  set(object: PropertyBase) {
    super.set(object);
  }
  get(object: PropertyBase) {
    let val = [];
    if (object.connectObject && object.connectObject.length > 0) {
      let data = [];
      for (let i = 0; i < object.connectObject.length; i++) {
        let obj = object.connectObject[i];
        data.push(obj.object);
      }
      val = data;
    }
    return val;
  }
}
MainProperty.addProperty('relationships', PropertyRelationships);

@Entity()
export class PropertyBase extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: String() })
  name: string;

  @Column({ default: String() })
  description: string;

  @Column({ default: MainProperty.getDefault() })
  type: string;

  @Column({ default: 1 })
  status: number;

  @Column({ type: 'json' })
  attribute: Object;

  @ManyToOne((type) => ObjectBase, (obj) => obj.properties)
  parent: ObjectBase;

  @OneToMany((type) => ValueObject, (obj) => obj.property)
  connectObject: ValueObject[];

  @OneToMany((type) => ValueMedia, (obj) => obj.property)
  connectMeida: ValueMedia[];

  value: any = {};

  @AfterLoad()
  AfterLoad() {
    let property = MainProperty.get(this.type);
    if (property) {
      this.value = property.get(this);
    }
  }

  AfterUpdate() {
    let property = MainProperty.get(this.type);
    if (property) {
      property.set(this);
    }
  }
}
