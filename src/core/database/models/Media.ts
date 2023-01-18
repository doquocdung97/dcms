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
  CreateDateColumn,
  UpdateDateColumn,
  DataSource,
  In,
  ManyToOne,
} from 'typeorm';
import { ValueMedia } from './ValueMedia';
import { PropertyBase } from './Property';
import { handleUpdateJoinTable } from 'core/common';
import { BasePropertyType, MainProperty } from '../common';
import { User } from './User';

@Entity()
export class BaseMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  name: string;

  @Column()
  url: string;

  @Column({ default: false })
  public: boolean;

  @OneToMany((type) => ValueMedia, (obj) => obj.object)
  connect: ValueMedia[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  lastUpdatedDate: Date;

  properties: any = [];

  @ManyToOne((type) => User)
  user: User;

  @AfterLoad()
  AfterLoad() {
    if (this.connect && this.connect.length) {
      let data = [];
      for (let i = 0; i < this.connect.length; i++) {
        const element = this.connect[i];
        if (element) {
          data.push(element.property);
        }
      }
      this.properties = data;
    }
  }
}
class PropertyMedia extends BasePropertyType {
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
    let medias = await mediaRepository.find({
      where: { id: object.value },
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
      return;
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
