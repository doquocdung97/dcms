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
import { handleUpdateJoinTable, CustomUUID } from 'core/common';
import { BasePropertyType, MainProperty } from '../common';
import { User } from './User';
import { Field, Int, ObjectType } from '@nestjs/graphql';
@ObjectType()
@Entity()
export class BaseMedia {
  @Field((type) => CustomUUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ default: '' })
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

  @Field((type) => [PropertyBase])
  properties: PropertyBase[] = [];

  @Field()
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
