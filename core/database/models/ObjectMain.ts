import {
    Entity,
    PrimaryGeneratedColumn,

    TreeChildren,
    TreeParent,
    Tree,
    OneToOne,
    JoinColumn,
    Column,
  } from 'typeorm';
import { ObjectBase } from './ObjectBase';
import { Variable } from '../../constants';
@Entity()
@Tree("materialized-path")
export class ObjectMain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: String(),length:50 })
  name: string;

  @TreeChildren()
  children: ObjectMain[];

  @TreeParent({
    onDelete: Variable.CASCADE,
  })
  parent: ObjectMain;

  @OneToOne(() => ObjectBase,(obj)=>obj.main,{
    onDelete: Variable.CASCADE,
  })
  @JoinColumn({name:"id"})
  detail: ObjectBase
}
