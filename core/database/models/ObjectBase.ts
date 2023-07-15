// import { handleUpdateJoinTable, validateUUID } from '../../common';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TreeChildren,
  TreeParent,
  OneToMany,
  DataSource,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  In,
  Tree,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BasePropertyType, MainProperty } from '../common';
import { PropertyBase } from './Property';
import { ValueObject } from './ValueObject';
import { ObjectMain, } from './ObjectMain';
import { BaseDocument } from './Document';


@Entity()
export class ObjectBase {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ObjectMain, (obj) => obj.detail)
  main: ObjectMain

  @Column({ default: String() })
  name: string;

  @Column({ nullable: true, default: String() })
  type: string;

  //@Column()
  //public get fullName(): string {
  //  return `${this.name} test`;
  //}

  @OneToMany((type) => PropertyBase, (obj) => obj.parent, {
    onDelete: 'CASCADE',
  })
  properties: PropertyBase[];

  @OneToMany((type) => ValueObject, (obj) => obj.object, {
    onDelete: 'CASCADE',
  })
  connect: ValueObject[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToOne(() => BaseDocument, obj => obj.objects, { nullable: false })
  document: BaseDocument
  static create(id: string): ObjectBase {
    let obj = new ObjectBase();
    obj.id = id;
    return obj;
  }
  toJson(){
    let property = {}
    this.properties?.map(pro => {
      if(pro.value instanceof ObjectBase){
        property[pro.name] = pro.value.toJson()
      }else if(pro.value instanceof Array && pro.value[0] instanceof ObjectBase){
        property[pro.name] = pro.value?.map(x=>x.toJson())
      }else{
        property[pro.name] = pro.value
      }
      
    })
    let fields = ['id', 'updatedAt', 'createdAt']
    fields.map(field => {
        property[field] = this[field]
    })
    return property
  }
}