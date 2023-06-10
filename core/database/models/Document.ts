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
import { User } from './User';
import { ObjectBase } from './ObjectBase';
import { BaseMedia } from './Media';
@Entity()
export class BaseDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany((type) => AuthContentDocument, (obj) => obj.document)
  auths: AuthContentDocument[];

  @OneToMany(() => ObjectBase, (obj) => obj.document)
  objects: ObjectBase[];

  @OneToMany(() => BaseMedia, (obj) => obj.document)
  medias: [BaseMedia];

  static create(id:string):BaseDocument{
    let doc =  new BaseDocument()
    doc.id = id
    return doc
  }
  // toJSON() {
  //   return {
  //     somethingCool: "test", 
  //   }
  // }
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

@Entity()
export class AuthContentDocument {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ default: Role.CUSTOM })
  role: Role;

  @Column({ default: true })
  query: boolean;

  @Column({ default: true })
  create: boolean;

  @Column({ default: true })
  edit: boolean;

  @Column({ default: true })
  setting: boolean;

  @Column({ default: true })
  delete: boolean;

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
  constructor(role: Role = null, user: User = null) {
    if (role != null) this.setValueByRole(role);
    this.user = user;
  }
}
