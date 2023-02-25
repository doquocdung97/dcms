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
  OneToMany,
} from 'typeorm';
import { hashSync, compareSync } from 'bcrypt';
import { PasswordConfig } from 'src/constants';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AuthContentDocument, BaseDocument } from './Document';
@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 50 })
  name: string;

  @Field()
  @Column({
    length: 100,
    //unique: true,
  })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true, length: 12 })
  phone: string;

  @Column()
  password: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field((type) => [AuthContentDocument], { defaultValue: [] })
  @OneToMany((type) => AuthContentDocument, (obj) => obj.user)
  connect: AuthContentDocument[];

  //@OneToMany((type) => BaseDocument, (obj) => obj.user, {
  //  onDelete: 'CASCADE',
  //})
  //document: BaseDocument[];

  @BeforeInsert()
  @BeforeUpdate()
  BeforeUpdate() {
    if (this.password) {
      this.password = hashSync(this.password, PasswordConfig.ROUNDS);
    }
  }
  checkPassword(password: string) {
    return compareSync(password, this.password);
  }
  static getByRequest(request: any, required = true): User {
    try {
      let user = request.req?.user;
      if (!user) {
        user = request.user;
      }
      if (!user && required) {
        throw new TypeError('User not found');
      }
      return user;
    } catch (ex) {
      throw new TypeError(ex);
    }
  }
}
