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
  BeforeInsert,
  DataSource,
  In,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { BaseMedia } from './Media';
import { ValueObject } from './ValueObject';
import { ValueMedia } from './ValueMedia';
import { BasePropertyType, MainProperty, TypeProperty } from '../common';

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
class PropertyMedia extends BasePropertyType {
  dataInTable = false;
  async set(object: PropertyBase, dataSource: DataSource) {
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
        newvalue.lang = String();
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
  get(object: PropertyBase) {
    let val = null;
    if (object.connectMeida && object.connectMeida.length > 0) {
      val = object.connectMeida[0].object;
    }
    return val;
  }
}
MainProperty.addProperty('media', PropertyMedia);

class PropertyMedias extends BasePropertyType {
  dataInTable = false;
  async set(object: PropertyBase, dataSource: DataSource) {
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
        newvalue.lang = String();
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
MainProperty.addProperty('medias', PropertyMedias);
import {
  createUnionType,
  Field,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {  handleUpdateJoinTable } from 'core/common';
import { CustomObject } from 'core/graphql';
//create value enum type property
let typeproperties = MainProperty.getTypes();
typeproperties.map((item) => {
  let property = item.toUpperCase();
  TypeProperty[property] = property;
});
registerEnumType(TypeProperty, {
  name: 'TypeProperty',
  description: 'The basic directions',
  valuesMap: {},
});
import { ObjectBase } from './ObjectBase';
@ObjectType()
@Entity()
export class PropertyBase extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ default: String() })
  name: string;

  @Field()
  @Column({ default: String() })
  description: string;

  @Field((type) => TypeProperty)
  @Column({ enum: TypeProperty, type: 'enum' })
  type: TypeProperty;

  @Field()
  @Column({ default: 1 })
  status: number;

  @Column({ type: 'json', default: null })
  attribute: Object;

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

  @Field((type) => CustomObject, { nullable: true })
  value: any = {};

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn()
  deleteAt: Date;

  @AfterLoad()
  AfterLoad() {
    this.value = null;
    let property = MainProperty.get(this.type);
    if (property) {
      this.value = property.get(this);
    }
  }

  async AfterUpdate(dataSource: DataSource) {
    let property = MainProperty.get(this.type);
    if (property) {
      this.value = await property.set(this, dataSource);
    }
  }
}
