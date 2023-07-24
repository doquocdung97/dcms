import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { PropertyBase } from './Property';
import { BaseMedia } from './Media';
import { Variable } from '../../constants';

@Entity()
export class ValueMedia {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne((type) => BaseMedia, (obj) => obj.connect, {
    onDelete: Variable.CASCADE,
    eager: true
  })
  object: BaseMedia;

  @ManyToOne((type) => PropertyBase, (obj) => obj.connectMeida, {
    onDelete: Variable.CASCADE,
  })
  property: PropertyBase;

  @Column({ default: String() })
  lang: string;
}
