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
@ObjectType()
@Entity()
export class Token {
    @Field()
    @PrimaryGeneratedColumn()
    id: string;

    @Field()
    @Column({ length: 50 })
    name: string;

    @Field()
    @Column({ length: 250 })
    description: string;

    @Field()
    @Column({ length: 250 })
    token: string;
}
