import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from './User';
import { ObjectBase } from './ObjectBase';
import { AuthContentDocument } from './Document';
@ObjectType()
@Entity()
export class Authentication {
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column({ default: true })
  query: boolean;

  @Field()
  @Column({ default: true })
  create: boolean;

  @Field()
  @Column({ default: true })
  edit: boolean;

  @Field()
  @Column({ default: true })
  delete: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => ObjectBase)
  object: ObjectBase;

  //@OneToMany(() => AuthContentDocument, (obj) => obj.auth)
  //connect: AuthContentDocument[];
}
enum Role {
  ADMIN,
  EDITTOR,
  ONLYVIEW,
  QC,
}
