import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { AdminStatus } from '../admin.enums';
import { Crisis } from './crisis.entity';
import { Announcement } from './announcement.entity';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  // 1:1 — one admin row per user
  @OneToOne(() => User, (user) => user.admin)
  @JoinColumn()
  user!: User;

  @Column({ type: 'varchar', length: 60 })
  fullName!: string;

  // bigint comes back as a string from pg
  @Column({ type: 'bigint' })
  phone!: string;

  @Column({ type: 'varchar', length: 40 })
  city!: string;

  @Column({ type: 'int' })
  age!: number;

  @Column({ type: 'enum', enum: AdminStatus })
  status!: AdminStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage!: string;

  @OneToMany(() => Crisis, (crisis) => crisis.declaredByAdmin)
  crises!: Crisis[];

  @OneToMany(() => Announcement, (announcement) => announcement.admin)
  announcements!: Announcement[];
}
