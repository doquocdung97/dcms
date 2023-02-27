import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { PropertyBase } from './Property';
import { ObjectBase } from './ObjectBase';

@Entity()
export class ValueObject {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne((type) => ObjectBase, (obj) => obj.connect, {
    onDelete: 'CASCADE',
    eager: true
  })
  object: ObjectBase;

  @ManyToOne((type) => PropertyBase, (obj) => obj.connectObject, {
    onDelete: 'CASCADE',
  })
  property: PropertyBase;

  @Column({default:String()})
  lang: string;
}
