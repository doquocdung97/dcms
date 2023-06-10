import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  AfterLoad,
  ManyToOne,
  OneToMany,
  DataSource,
  In,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { BaseMedia } from './Media';
import { ValueObject } from './ValueObject';
import { ValueMedia } from './ValueMedia';
import { BasePropertyType, MainProperty, TypeProperty } from '../common';

import { handleUpdateJoinTable, validateUUID } from '../../common';
import { Variable } from '../../constants';

import { ObjectBase } from './ObjectBase';
import { ValueStandard } from './ValueStandard';
// import { VariableMain } from 'src/constants';

@Entity()
@Index(['name', 'parent'], { unique: true })
export class PropertyBase extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: String(), length: 50 })
  name: string;

  @Column({ default: String() })
  description: string;

  @Column()
  type: TypeProperty;

  @Column({ default: 0 })
  max: number;

  @Column({ default: 0 })
  min: number;

  @Column({ default: 1 })
  status: number;

  // @Column({ default: null })
  // attribute_str: string;

  attribute: any;

  @ManyToOne((type) => ObjectBase, (obj) => obj.properties, {
    onDelete: 'CASCADE',
  })
  parent: ObjectBase;

  @OneToMany((type) => ValueObject, (obj) => obj.property, {
    onDelete: 'CASCADE',
  })
  connectObject: ValueObject[];

  @OneToMany((type) => ValueMedia, (obj) => obj.property, {
    onDelete: 'CASCADE',
  })
  connectMeida: ValueMedia[];

  @OneToMany((type) => ValueStandard, (obj) => obj.property, {
    onDelete: 'CASCADE',
  })
  connectStandard: ValueStandard[];

  value: any = {};

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @AfterLoad()
  AfterLoad() {
    this.value = null;
    let property = mainproperty.get(this.type);
    if (property) {
      this.value = property.get(this);
    }
  }

  async AfterUpdate(dataSource: DataSource) {
    let property = mainproperty.get(this.type);
    if (property) {
      this.value = await property.setData(this, dataSource);
    }
  }
}
let mainproperty = new MainProperty()
class PropertyString extends BasePropertyType {
  /**
   * Design Pattern:
   * Structural Pattern - Decorator Pattern
   */
  get(object: PropertyBase) {
    return super.get(object) || String();
  }
  validate(val: any): boolean {
    if ((typeof val) == Variable.STRING) {
      return true
    }
  }
}
mainproperty.addProperty('string', PropertyString);


/**
 * Design Pattern:
 * Structural Pattern - Bridge Pattern
 */

class PropertyStrings extends BasePropertyType {
  get(object: PropertyBase) {
    return super.get(object) || [];
  }
  validate(val: any): boolean {
    if (val instanceof Array) {
      let vals = [];
      val.map(v => {
        vals.push(String(v))
      })
      val = vals
      return true
    }
  }
}
mainproperty.addProperty('strings', PropertyStrings);

/**
 * Design Pattern
 * Structural Pattern - Composite Pattern
 * Leaf class
 */
class PropertyNumber extends BasePropertyType {
  get(object: PropertyBase) {
    return super.get(object) || 0;
  }
  validate(val: any): boolean {
    if ((typeof val) == Variable.NUMBER) {
      return true
    }
  }
}
mainproperty.addProperty('number', PropertyNumber);

class PropertyNumbers extends BasePropertyType {
  get(object: PropertyBase) {
    return super.get(object) || [];
  }
  validate(val: any): boolean {
    if (val instanceof Array) {
      let status = true;
      val.map(v => {
        if ((typeof v) != Variable.NUMBER) {
          status = false;
        }
      })
      return status;
    }
  }
}
mainproperty.addProperty('numbers', PropertyNumbers);

class PropertyJson extends BasePropertyType {
  get(object: PropertyBase) {
    return super.get(object) || {};
  }
}
mainproperty.addProperty('json', PropertyJson);

class PropertyMedia extends BasePropertyType {
  dataInTable = false;
  async set(object: PropertyBase, dataSource: DataSource) {
    var val = object.value;
    if (!this.validate(val)) {
      return null;
    }
    const queryRunner = dataSource.createQueryRunner();
    let mediaRepository = queryRunner.manager.getRepository(BaseMedia);
    let connectRepository = queryRunner.manager.getRepository(ValueMedia);

    let connect = await connectRepository.find({
      relations: {
        property: true,
        object: true,
      },
      where: {
        property: {
          id: object.id,
        },
      },
    });
    if (!object.value) {
      connectRepository.remove(connect);
      return;
    }

    let media = await mediaRepository.findOne({
      where: { id: object.value },
    });
    if (!media) {
      return null
    }
    let join = handleUpdateJoinTable<ValueMedia, BaseMedia>(
      [media],
      connect,
      (item, properties, index) => {
        return (
          item['object'] && item['object']['id'] && index < properties.length
        );
      },
      (item, media) => {
        item.object = media;
      },
      (media: any) => {
        let newvalue = new ValueMedia();
        newvalue.object = media;
        newvalue.property = object;
        return newvalue;
      },
    );

    let rowdata = join.create_item.concat(join.update_item);
    connectRepository.save(rowdata);

    if (join.delete_item.length > 0) {
      connectRepository.remove(join.delete_item);
    }
    return media;
  }
  validate(val: any): boolean {
    if ((typeof val) == Variable.STRING && validateUUID(val)) {
      return true
    }
  }
  get(object: PropertyBase) {
    let val = null;
    if (object.connectMeida && object.connectMeida.length > 0) {
      val = object.connectMeida[0].object;
    }
    return val;
  }
}
mainproperty.addProperty('media', PropertyMedia);

class PropertyMedias extends BasePropertyType {
  dataInTable = false;
  async set(object: PropertyBase, dataSource: DataSource) {
    var val = object.value;
    if (!this.validate(val)) {
      return null;
    }
    const queryRunner = dataSource.createQueryRunner();
    let mediaRepository = queryRunner.manager.getRepository(BaseMedia);
    let connectRepository = queryRunner.manager.getRepository(ValueMedia);
    let ids = object.value || [];
    let connect = await connectRepository.find({
      relations: {
        property: true,
        object: true,
      },
      where: {
        property: {
          id: object.id,
        },
      },
    });
    if (ids.length == 0) {
      connectRepository.remove(connect);
      return [];
    }
    let medias = await mediaRepository.find({
      where: { id: In(ids) },
    });

    let join = handleUpdateJoinTable<ValueMedia, BaseMedia>(
      medias,
      connect,
      (item, properties, index) => {
        return (
          item['object'] && item['object']['id'] && index < properties.length
        );
      },
      (item, media) => {
        item.object = media;
      },
      (media: any) => {
        let newvalue = new ValueMedia();
        newvalue.object = media;
        newvalue.property = object;
        return newvalue;
      },
    );
    let rowdata = join.create_item.concat(join.update_item);
    connectRepository.save(rowdata);

    if (join.delete_item.length > 0) {
      connectRepository.remove(join.delete_item);
    }
    return medias || [];
  }
  validate(val: any): boolean {
    if (val instanceof Array) {
      val.map(item => {
        if (!validateUUID(item)) {
          return null
        }
      })
      return true
    }
  }
  get(object: PropertyBase) {
    let val = [];
    if (object.connectMeida && object.connectMeida.length > 0) {
      let data = [];
      for (let i = 0; i < object.connectMeida.length; i++) {
        let obj = object.connectMeida[i];
        data.push(obj.object);
      }
      val = data;
    }
    return val;
  }
}
mainproperty.addProperty('medias', PropertyMedias);

class PropertyRelationship extends BasePropertyType {
  validate(val: any): boolean {
    if ((typeof val) == Variable.STRING && validateUUID(val)) {
      return true
    }
  }
  async set(property: PropertyBase, dataSource: DataSource) {
    var val = property.value;
    if (!this.validate(val)) {
      return null;
    }
    const queryRunner = dataSource.createQueryRunner();
    let objectRepository = queryRunner.manager.getRepository(ObjectBase);
    let connectRepository = queryRunner.manager.getRepository(ValueObject);
    let id = property.value || String();
    if (id == property.parent?.id) {
      id = String();
    }
    let connect = await connectRepository.find({
      relations: {
        property: true,
        object: true,
      },
      where: {
        property: {
          id: property.id,
        },
      },
    });
    if (!id) {
      connectRepository.remove(connect);
      return;
    }
    let object = await objectRepository.findOne({
      where: { id: id },
    });
    let join = handleUpdateJoinTable<ValueObject, ObjectBase>(
      [object],
      connect,
      (item, properties, index) => {
        return (
          item['object'] && item['object']['id'] && index < properties.length
        );
      },
      (item, media) => {
        item.object = media;
      },
      (media: any) => {
        let newvalue = new ValueObject();
        newvalue.object = media;
        newvalue.property = property;
        return newvalue;
      },
    );
    let rowdata = join.create_item.concat(join.update_item);
    connectRepository.save(rowdata);

    if (join.delete_item.length > 0) {
      connectRepository.remove(join.delete_item);
    }
    return object;
  }
  get(object: PropertyBase) {
    let val = null;
    if (object.connectObject && object.connectObject.length > 0) {
      val = object.connectObject[0].object;
    }
    return val;
  }
}
mainproperty.addProperty('relationship', PropertyRelationship);

class PropertyRelationships extends BasePropertyType {
  validate(val: any): boolean {
    if (val instanceof Array) {
      val.map(item => {
        if (!validateUUID(item)) {
          return null
        }
      })
      return true
    }
  }
  async set(property: PropertyBase, dataSource: DataSource) {
    var val = property.value;
    if (!this.validate(val)) {
      return null;
    }
    const queryRunner = dataSource.createQueryRunner();
    let objectRepository = queryRunner.manager.getRepository(ObjectBase);
    let connectRepository = queryRunner.manager.getRepository(ValueObject);
    let ids = property.value || [];
    if (ids) {
      let index = ids.indexOf(property.parent?.id);
      if (index >= 0) {
        ids.splice(index, 1);
      }
    }

    let connect = await connectRepository.find({
      relations: {
        property: true,
        object: true,
      },
      where: {
        property: {
          id: property.id,
        },
      },
    });
    if (ids.length == 0) {
      connectRepository.remove(connect);
      return [];
    }
    let objects = await objectRepository.find({
      where: { id: In(ids) },
    });
    let join = handleUpdateJoinTable<ValueObject, ObjectBase>(
      objects,
      connect,
      (item, properties, index) => {
        return (
          item['object'] && item['object']['id'] && index < properties.length
        );
      },
      (item, media) => {
        item.object = media;
      },
      (media: any) => {
        let newvalue = new ValueObject();
        newvalue.object = media;
        newvalue.property = property;
        return newvalue;
      },
    );
    let rowdata = join.create_item.concat(join.update_item);
    connectRepository.save(rowdata);

    if (join.delete_item.length > 0) {
      connectRepository.remove(join.delete_item);
    }
    return objects;
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
mainproperty.addProperty('relationships', PropertyRelationships);
