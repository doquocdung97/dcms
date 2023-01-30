import { handleUpdateJoinTable } from 'core/common';
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  TreeChildren,
  TreeParent,
  OneToMany,
  VirtualColumn,
  AfterLoad,
  DataSource,
  In,
} from 'typeorm';
import { BasePropertyType, MainProperty } from '../common';
import { PropertyBase } from './Property';
import { ValueObject } from './ValueObject';

@Entity()
export class ObjectBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: String() })
  name: string;

  @Column({ nullable: true, default: String() })
  type: string;

  @TreeChildren()
  children: ObjectBase[];

  @TreeParent()
  parent: ObjectBase;

  //@Column()
  //public get fullName(): string {
  //  return `${this.name} test`;
  //}

  value: any = {};

  @OneToMany((type) => PropertyBase, (obj) => obj.parent)
  properties: PropertyBase[];

  @OneToMany((type) => ValueObject, (obj) => obj.object)
  connect: ValueObject[];

  //@CreateDateColumn()
  //createdDate: Date;

  //@UpdateDateColumn()
  //lastUpdatedDate: Date;
}

class PropertyRelationship extends BasePropertyType {
  async set(property: PropertyBase, dataSource: DataSource) {
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
    let objects = await objectRepository.find({
      where: { id: id },
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
        newvalue.lang = String();
        return newvalue;
      },
    );
    let rowdata = join.create_item.concat(join.update_item);
    connectRepository.save(rowdata);

    if (join.delete_item.length > 0) {
      connectRepository.remove(join.delete_item);
    }
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
  async set(property: PropertyBase, dataSource: DataSource) {
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
      return;
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
        newvalue.lang = String();
        return newvalue;
      },
    );
    let rowdata = join.create_item.concat(join.update_item);
    connectRepository.save(rowdata);

    if (join.delete_item.length > 0) {
      connectRepository.remove(join.delete_item);
    }
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
