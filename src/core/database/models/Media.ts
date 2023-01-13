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
} from 'typeorm';
import { ValueMedia } from './ValueMedia';
import { MainProperty, BasePropertyType, PropertyBase } from './Property';
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
  set(object: PropertyBase) {
    super.set(object);
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
  set(object: PropertyBase) {
    console;
    super.set(object);
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
