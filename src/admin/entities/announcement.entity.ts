import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Admin } from './admin.entity';
import { User } from '../../common/entities/user.entity';

@Entity('announcement')
export class Announcement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'boolean', default: false })
  isUrgent!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Admin, (admin) => admin.announcements)
  admin!: Admin;

  // M:N — join table announcement_recipient
  @ManyToMany(() => User, (user) => user.announcements)
  @JoinTable({ name: 'announcement_recipient' })
  recipients!: User[];
}
