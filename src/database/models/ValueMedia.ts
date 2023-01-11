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
import BaseMedia from './Media';

@Entity()
export default class ValueMedia {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(type => BaseMedia, obj => obj.connect)
  object: BaseMedia;

  @ManyToOne(type => PropertyBase, obj => obj.connectMeida)
  property: PropertyBase;

  @Column()
  lang: string;
}
