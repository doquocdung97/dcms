import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TreeChildren,
  TreeParent,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import PropertyBase from './Property';
import ObjectBase from './ObjectBase';

@Entity()
export default class ValueObject {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(type => ObjectBase, obj => obj.connect)
  object: ObjectBase;

  @ManyToOne(type => PropertyBase, obj => obj.connectObject)
  property: PropertyBase;

  @Column()
  lang: string;
}
