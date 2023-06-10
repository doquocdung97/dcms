import { Field, ObjectType } from '@nestjs/graphql';
import { CustomUUID } from 'src/graphql';
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
@ObjectType()
@Entity()
@Tree("materialized-path")
export class ObjectMain {
  @Field((type) => CustomUUID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ default: String(),length:50 })
  name: string;

  @Field(() => [ObjectMain],{defaultValue:[]})
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
