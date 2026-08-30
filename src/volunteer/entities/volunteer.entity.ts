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
import { Skill } from './skill.entity';
import { Application } from './application.entity';

@Entity('volunteer')
export class Volunteer {
  @PrimaryGeneratedColumn()
  id!: number;

  // 1:1 — one volunteer row per user
  @OneToOne(() => User, (user) => user.volunteer)
  @JoinColumn()
  user!: User;

  @Column({ type: 'varchar', length: 40, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 60 })
  fullName!: string;

  // bigint comes back as a string from pg
  @Column({ type: 'bigint' })
  phone!: string;

  @Column({ type: 'varchar', length: 40 })
  city!: string;

  @Column({ type: 'boolean', default: true })
  isAvailable!: boolean;

  @Column({ type: 'int', default: 0 })
  totalHours!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage!: string;

  @OneToMany(() => Application, (application) => application.volunteer)
  applications!: Application[];

  // M:N — join table volunteer_skill
  @ManyToMany(() => Skill, (skill) => skill.volunteers)
  @JoinTable({ name: 'volunteer_skill' })
  skills!: Skill[];
}
