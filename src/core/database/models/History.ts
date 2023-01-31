import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  TreeChildren,
  TreeParent,
  OneToMany,
  VirtualColumn,
  AfterLoad,
  CreateDateColumn,
  UpdateDateColumn,
  DataSource,
  In,
  ManyToOne,
} from 'typeorm';
import { ValueMedia } from './ValueMedia';
import { User } from './User';
import { BaseMedia } from './Media';

@Entity()
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  command: string;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn()
  createdDate: Date;

  @ManyToOne((type) => User)
  user: User;

  @ManyToOne((type) => BaseMedia, (obj) => obj.historys)
  media: BaseMedia;
}
