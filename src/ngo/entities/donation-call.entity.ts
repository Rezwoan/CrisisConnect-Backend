import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Ngo } from './ngo.entity';
import { Crisis } from '../../admin/entities/crisis.entity';
import { DonationCallStatus } from '../ngo.enums';
import { Donation } from '../../donor/entities/donation.entity';

@Entity('donation_call')
export class DonationCall {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  // decimal comes back as a string from pg — Number(...) before arithmetic
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  targetAmount!: string;

  // decimal comes back as a string from pg — Number(...) before arithmetic
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  raisedAmount!: string;

  @Column({ type: 'enum', enum: DonationCallStatus, default: DonationCallStatus.OPEN })
  status!: DonationCallStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Ngo, (ngo) => ngo.donationCalls)
  ngo!: Ngo;

  @ManyToOne(() => Crisis, (crisis) => crisis.donationCalls)
  crisis!: Crisis;

  @OneToMany(() => Donation, (donation) => donation.donationCall)
  donations!: Donation[];
}
