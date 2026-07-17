import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Donation } from './donation.entity';
import { PaymentStatus } from '../donor.enums';
import { Receipt } from './receipt.entity';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  // 1:1 — one payment per donation
  @OneToOne(() => Donation, (donation) => donation.payment)
  @JoinColumn()
  donation!: Donation;

  @Column({ type: 'varchar', length: 4 })
  cardLast4!: string;

  @Column({ type: 'enum', enum: PaymentStatus })
  status!: PaymentStatus;

  @CreateDateColumn()
  attemptedAt!: Date;

  // 1:1 inverse — @JoinColumn lives on receipt
  @OneToOne(() => Receipt, (receipt) => receipt.payment)
  receipt!: Receipt;
}
