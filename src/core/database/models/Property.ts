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
  DataSource,
} from 'typeorm';
import { ObjectBase } from './ObjectBase';
import { ValueObject } from './ValueObject';
import { ValueMedia } from './ValueMedia';
import { BasePropertyType, MainProperty } from '../common';

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

  AfterUpdate(dataSource: DataSource) {
    let property = MainProperty.get(this.type);
    if (property) {
      property.set(this, dataSource);
    }
  }
}
