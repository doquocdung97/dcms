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
import { File } from 'core/common';
import { CustomUUID } from 'src/graphql';
import { BasePropertyType, MainProperty } from '../common';
import { User } from './User';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseDocument } from './Document';

@ObjectType()
@Entity()
export class BaseMedia {
  @Field((type) => CustomUUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ default: '', length: 50 })
  name: string;
  @Field()
  @Column()
  url: string;
  @Field()
  @Column({ default: false })
  public: boolean;

  @OneToMany((type) => ValueMedia, (obj) => obj.object)
  connect: ValueMedia[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn()
  deleteAt: Date;

  @Field((type) => [PropertyBase], { defaultValue: [] })
  properties: PropertyBase[];

  @Field()
  @ManyToOne((type) => User)
  user: User;

  file: File;

  @ManyToOne(() => BaseDocument, (obj) => obj.medias, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  document: BaseDocument;

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
