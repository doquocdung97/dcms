import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from './User';
import { Authentication } from './Authentication';
import { ifError } from 'assert';
import { ObjectBase } from './ObjectBase';
@ObjectType()
@Entity()
export class BaseDocument {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 50 })
  name: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [AuthContentDocument], { defaultValue: [] })
  @OneToMany((type) => AuthContentDocument, (obj) => obj.document)
  auths: AuthContentDocument[];

  //@Field(() => User)
  //@ManyToOne(() => User,(obj) => obj.document)
  //user: User;
  //
  //@AfterLoad()
  //AfterLoad() {
  //  let auth = new AuthContentDocument(Role.SUPERADMIN);
  //  auth.user = this.user;
  //  if (!this.auths) this.auths = [];
  //  this.auths.push(auth);
  //}
  @Field(() => [ObjectBase], { defaultValue: [] })
  @OneToMany(()=>ObjectBase,obj=>obj.document)
  objects:ObjectBase[]
}
export enum InputRole {
  ADMIN,
  EDITTOR,
  ONLYVIEW,
  QC,
  CUSTOM,
}

export enum Role {
  ADMIN,
  EDITTOR,
  ONLYVIEW,
  QC,
  CUSTOM,
  SUPERADMIN,
}

@ObjectType()
@Entity()
export class AuthContentDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => BaseDocument)
  @ManyToOne((type) => BaseDocument, (obj) => obj.auths, {
    onDelete: 'CASCADE',
  })
  document: BaseDocument;
  //
  //@Field(() => Authentication)
  //@ManyToOne((type) => Authentication, (obj) => obj.connect, {
  //  onDelete: 'CASCADE',
  //})
  //auth: Authentication;

  @Field(() => Role)
  @Column({ default: Role.CUSTOM })
  role: Role;

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
  setting: boolean;

  @Field()
  @Column({ default: true })
  delete: boolean;

  @Field(() => User)
  @ManyToOne((type) => User, (obj) => obj.connect, {
    onDelete: 'CASCADE',
  })
  user: User;

  @AfterLoad()
  AfterLoad() {
    this.setValueByRole();
  }
  setValueByRole(role: Role = null) {
    if (role != null) this.role = role;
    if (this.role == Role.SUPERADMIN) {
      this.query = true;
      this.create = true;
      this.edit = true;
      this.delete = true;
      this.setting = true;
    } else if (this.role == Role.ADMIN) {
      this.query = true;
      this.create = true;
      this.edit = true;
      this.delete = true;
      this.setting = false;
    } else if (this.role == Role.EDITTOR) {
      this.query = true;
      this.create = true;
      this.edit = true;
      this.delete = false;
      this.setting = false;
    } else if (this.role == Role.ONLYVIEW) {
      this.query = true;
      this.create = false;
      this.edit = false;
      this.delete = false;
      this.setting = false;
    } else if (this.role == Role.QC) {
      this.query = true;
      this.create = true;
      this.edit = true;
      this.delete = true;
      this.setting = false;
    }
  }
  constructor(role: Role = null, user:User = null) {
    if (role != null) this.setValueByRole(role);
    this.user = user
    }
}
