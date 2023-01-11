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
} from 'typeorm';
import PropertyBase from './Property';
import ValueObject from './ValueObject';

@Entity()
export default class ObjectBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  name: string;

  @TreeChildren()
  children: ObjectBase[];

  @TreeParent()
  parent: ObjectBase;

  //@Column()
  //public get fullName(): string {
  //  return `${this.name} test`;
  //}

  value: any = {};

  @OneToMany(type => PropertyBase, obj => obj.parent)
  properties: PropertyBase[];

  @OneToMany(type => ValueObject, obj => obj.object)
  connect: ValueObject[];

  //@CreateDateColumn()
  //createdDate: Date;

  //@UpdateDateColumn()
  //lastUpdatedDate: Date;
}
