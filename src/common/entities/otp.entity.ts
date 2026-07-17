import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { OtpPurpose } from '../common.enums';
import { User } from './user.entity';

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.otps)
  user!: User;

  @Column({ type: 'varchar', length: 200 })
  codeHash!: string;

  @Column({ type: 'enum', enum: OtpPurpose })
  purpose!: OtpPurpose;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  isUsed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
