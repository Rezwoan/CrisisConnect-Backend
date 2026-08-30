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
import { VolunteerCallStatus } from '../ngo.enums';
import { Application } from '../../volunteer/entities/application.entity';

@Entity('volunteer_call')
export class VolunteerCall {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'int' })
  slots!: number;

  @Column({
    type: 'enum',
    enum: VolunteerCallStatus,
    default: VolunteerCallStatus.OPEN,
  })
  status!: VolunteerCallStatus;

  @Column({ type: 'varchar', length: 40 })
  city!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Ngo, (ngo) => ngo.volunteerCalls)
  ngo!: Ngo;

  @ManyToOne(() => Crisis, (crisis) => crisis.volunteerCalls)
  crisis!: Crisis;

  @OneToMany(() => Application, (application) => application.volunteerCall)
  applications!: Application[];
}
