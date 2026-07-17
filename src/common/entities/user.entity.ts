import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { UserRole } from '../common.enums';
import { Otp } from './otp.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { Announcement } from '../../admin/entities/announcement.entity';
import { Ngo } from '../../ngo/entities/ngo.entity';
import { Volunteer } from '../../volunteer/entities/volunteer.entity';
import { Donor } from '../../donor/entities/donor.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 200 })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Otp, (otp) => otp.user)
  otps!: Otp[];

  // 1:1 inverse — @JoinColumn lives on admin
  @OneToOne(() => Admin, (admin) => admin.user)
  admin!: Admin;

  // 1:1 inverse — @JoinColumn lives on ngo
  @OneToOne(() => Ngo, (ngo) => ngo.user)
  ngo!: Ngo;

  // 1:1 inverse — @JoinColumn lives on volunteer
  @OneToOne(() => Volunteer, (volunteer) => volunteer.user)
  volunteer!: Volunteer;

  // 1:1 inverse — @JoinColumn lives on donor
  @OneToOne(() => Donor, (donor) => donor.user)
  donor!: Donor;

  // M:N inverse — @JoinTable lives on announcement
  @ManyToMany(() => Announcement, (announcement) => announcement.recipients)
  announcements!: Announcement[];
}
