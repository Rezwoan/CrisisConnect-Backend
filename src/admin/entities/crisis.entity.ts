import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Admin } from './admin.entity';
import { CrisisSeverity, CrisisStatus } from '../admin.enums';
import { Ngo } from '../../ngo/entities/ngo.entity';
import { VolunteerCall } from '../../ngo/entities/volunteer-call.entity';
import { DonationCall } from '../../ngo/entities/donation-call.entity';
import { Donor } from '../../donor/entities/donor.entity';

@Entity('crisis')
export class Crisis {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 40 })
  category!: string;

  @Column({ type: 'enum', enum: CrisisSeverity })
  severity!: CrisisSeverity;

  @Column({ type: 'enum', enum: CrisisStatus, default: CrisisStatus.ACTIVE })
  status!: CrisisStatus;

  @Column({ type: 'varchar', length: 40 })
  city!: string;

  @CreateDateColumn()
  declaredAt!: Date;

  @ManyToOne(() => Admin, (admin) => admin.crises)
  declaredByAdmin!: Admin;

  @OneToMany(() => VolunteerCall, (volunteerCall) => volunteerCall.crisis)
  volunteerCalls!: VolunteerCall[];

  @OneToMany(() => DonationCall, (donationCall) => donationCall.crisis)
  donationCalls!: DonationCall[];

  // M:N inverse — @JoinTable (crisis_participation) lives on ngo
  @ManyToMany(() => Ngo, (ngo) => ngo.crises)
  ngos!: Ngo[];

  // M:N inverse — @JoinTable (crisis_follow) lives on donor
  @ManyToMany(() => Donor, (donor) => donor.followedCrises)
  followedByDonors!: Donor[];
}
