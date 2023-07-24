import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { PropertyBase } from './Property';
import { Variable } from '../../constants';

@Entity()
export class ValueStandard {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne((type) => PropertyBase, (obj) => obj.connectStandard, {
    onDelete: Variable.CASCADE,
  })
  property: PropertyBase;

  @Column({default:String()})
  lang: string;

	@Column({ default: null })
  value: string;
}