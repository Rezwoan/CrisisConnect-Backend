import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Donor } from './donor.entity';
import { DonationCall } from '../../ngo/entities/donation-call.entity';
import { DonationStatus } from '../donor.enums';
import { Payment } from './payment.entity';

@Entity('donation')
export class Donation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Donor, (donor) => donor.donations)
  donor!: Donor;

  @ManyToOne(() => DonationCall, (donationCall) => donationCall.donations)
  donationCall!: DonationCall;

  // decimal comes back as a string from pg — Number(...) before arithmetic
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 200 })
  message!: string;

  @Column({ type: 'enum', enum: DonationStatus, default: DonationStatus.INITIATED })
  status!: DonationStatus;

  @CreateDateColumn()
  createdAt!: Date;

  // 1:1 inverse — @JoinColumn lives on payment
  @OneToOne(() => Payment, (payment) => payment.donation)
  payment!: Payment;
}
