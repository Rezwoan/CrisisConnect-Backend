import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { Crisis } from '../../admin/entities/crisis.entity';
import { Donation } from './donation.entity';

@Entity('donor')
export class Donor {
  @PrimaryGeneratedColumn()
  id!: number;

  // 1:1 — one donor row per user
  @OneToOne(() => User, (user) => user.donor)
  @JoinColumn()
  user!: User;

  @Column({ type: 'varchar', length: 150 })
  uniqueId!: string;

  @Column({ type: 'varchar', length: 60 })
  fullName!: string;

  @Column({ type: 'varchar', length: 40 })
  city!: string;

  @Column({ type: 'varchar', length: 30, default: 'Unknown' })
  country!: string;

  @CreateDateColumn()
  joiningDate!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage!: string;

  @OneToMany(() => Donation, (donation) => donation.donor)
  donations!: Donation[];

  // M:N — join table crisis_follow
  @ManyToMany(() => Crisis, (crisis) => crisis.followedByDonors)
  @JoinTable({ name: 'crisis_follow' })
  followedCrises!: Crisis[];
}
