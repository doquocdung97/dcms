import { handleUpdateJoinTable } from 'core/common';
import { CustomUUID } from 'src/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TreeChildren,
  TreeParent,
  OneToMany,
  DataSource,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  In,
  Tree,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BasePropertyType, MainProperty } from '../common';
import { PropertyBase } from './Property';
import { ValueObject } from './ValueObject';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectMain, } from './ObjectMain';
import { BaseDocument } from './Document';


@ObjectType()
@Entity()
export class ObjectBase {
  @Field((type) => CustomUUID)
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ObjectMain,(obj) => obj.detail)
  main: ObjectMain
 
  @Field()
  @Column({ default: String() })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true, default: String() })
  type: string;

  //@Column()
  //public get fullName(): string {
  //  return `${this.name} test`;
  //}

  @Field((type) => [PropertyBase], { defaultValue: [] })
  @OneToMany((type) => PropertyBase, (obj) => obj.parent)
  properties: PropertyBase[];

  @OneToMany((type) => ValueObject, (obj) => obj.object, {
    onDelete: 'CASCADE',
  })
  connect: ValueObject[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToOne(()=>BaseDocument,obj=>obj.objects,{nullable:false})
  document:BaseDocument
}

let mainproperty = new MainProperty()
class PropertyRelationship extends BasePropertyType {
  dataInTable = false;
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
  dataInTable = false;
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
