import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity('receipt')
export class Receipt {
  @PrimaryGeneratedColumn()
  id!: number;

  // 1:1 — one receipt per payment
  @OneToOne(() => Payment, (payment) => payment.receipt)
  @JoinColumn()
  payment!: Payment;

  @Column({ type: 'varchar', length: 40, unique: true })
  receiptNo!: string;

  // decimal comes back as a string from pg — Number(...) before arithmetic
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @CreateDateColumn()
  issuedAt!: Date;
}
