import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { hashSync, compareSync } from 'bcrypt';
import { PasswordConfig } from 'src/Constants';
import { Field, Int, ObjectType } from '@nestjs/graphql';
@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field()
  @Column({
    length: 50,
    //unique: true
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
  static getByRequest(request: any): User {
    let user = request.req?.user;
    if (!user) {
      user = request.user;
    }
    return user;
  }
}
