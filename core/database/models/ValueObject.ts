import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { PropertyBase } from './Property';
import { ObjectBase } from './ObjectBase';
import { Variable } from '../../constants';

@Entity()
export class ValueObject {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne((type) => ObjectBase, (obj) => obj.connect, {
    onDelete: Variable.CASCADE,
    eager: true
  })
  object: ObjectBase;

  @ManyToOne((type) => PropertyBase, (obj) => obj.connectObject, {
    onDelete: Variable.CASCADE,
  })
  property: PropertyBase;

  @Column({default:String()})
  lang: string;
}
