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
    onDelete: 'CASCADE',
  })
  parent: ObjectMain;

  @OneToOne(() => ObjectBase,(obj)=>obj.main,{
    onDelete: 'CASCADE',
  })
  @JoinColumn({name:"id"})
  detail: ObjectBase
}
