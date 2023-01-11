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
import ValueMedia from './ValueMedia';

@Entity()
export default class BaseMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  name: string;

  @Column()
  url: string;

  @Column({ default: false })
  public: boolean;

  @OneToMany(type => ValueMedia, obj => obj.object)
  connect: ValueMedia[];
  //@CreateDateColumn()
  //createdDate: Date;

  //@UpdateDateColumn()
  //lastUpdatedDate: Date;
}
