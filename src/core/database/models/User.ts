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
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  email: string;

  @Column({ nullable: true, length: 12 })
  phone!: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  UpdatedDate: Date;

  @BeforeInsert()
  @BeforeUpdate()
  BeforeUpdate() {
    if (this.password) {
      this.password = hashSync(this.password, PasswordConfig.ROUNDS);
    }
  }
  checkPassword(password: string) {
    if (this.password) return compareSync(password, this.password);
  }
}
