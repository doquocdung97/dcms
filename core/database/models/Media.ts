import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  AfterLoad,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { ValueMedia } from './ValueMedia';
import { PropertyBase } from './Property';
import { File } from '../../common';
import { User } from './User';
import { BaseDocument } from './Document';
import { Variable } from '../../constants';
@Entity()
export class BaseMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: String(), length: 50 })
  name: string;

  @Column({ default: String(), length: 10 })
  type: string;

  @Column()
  url: string;

  @Column({ default: false })
  public: boolean;

  @OneToMany((type) => ValueMedia, (obj) => obj.object)
  connect: ValueMedia[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  properties: PropertyBase[];

  @ManyToOne((type) => User)
  user: User;

  file: File;

  @ManyToOne(() => BaseDocument, (obj) => obj.medias, {
    nullable: false,
    onDelete: Variable.CASCADE,
  })
  document: BaseDocument;

  @AfterLoad()
  AfterLoad() {
    if (this.connect && this.connect.length) {
      let data = [];
      for (let i = 0; i < this.connect.length; i++) {
        const element = this.connect[i];
        if (element && element.property) {
          data.push(element.property);
        }
      }
      this.properties = data;
    }
  }
  
  static create(id: string): BaseMedia {
    let media = new BaseMedia();
    media.id = id;
    return media;
  }
}
