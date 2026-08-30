import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { Crisis } from '../../admin/entities/crisis.entity';
import { VolunteerCall } from './volunteer-call.entity';
import { DonationCall } from './donation-call.entity';
import { Assignment } from './assignment.entity';

@Entity('ngo')
export class Ngo {
  @PrimaryGeneratedColumn()
  id!: number;

  // 1:1 — one ngo row per user
  @OneToOne(() => User, (user) => user.ngo)
  @JoinColumn()
  user!: User;

  @Column({ type: 'varchar', length: 100 })
  orgName!: string;

  @Column({ type: 'varchar', length: 60 })
  regNumber!: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  fullName!: string;

  // varchar, not bigint — a phone number is digits you display, not a
  // quantity you do maths with, and bigint silently drops the leading 0.
  @Column({ type: 'varchar', length: 11 })
  phone!: string;

  @Column({ type: 'varchar', length: 40 })
  city!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage!: string;

  @OneToMany(() => VolunteerCall, (volunteerCall) => volunteerCall.ngo)
  volunteerCalls!: VolunteerCall[];

  @OneToMany(() => DonationCall, (donationCall) => donationCall.ngo)
  donationCalls!: DonationCall[];

  @OneToMany(() => Assignment, (assignment) => assignment.ngo)
  assignments!: Assignment[];

  // M:N — join table crisis_participation
  @ManyToMany(() => Crisis, (crisis) => crisis.ngos)
  @JoinTable({ name: 'crisis_participation' })
  crises!: Crisis[];
}
