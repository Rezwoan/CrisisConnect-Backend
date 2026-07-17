import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Volunteer } from './volunteer.entity';
import { VolunteerCall } from '../../ngo/entities/volunteer-call.entity';
import { ApplicationStatus } from '../volunteer.enums';
import { Assignment } from '../../ngo/entities/assignment.entity';

@Entity('application')
export class Application {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Volunteer, (volunteer) => volunteer.applications)
  volunteer!: Volunteer;

  @ManyToOne(() => VolunteerCall, (volunteerCall) => volunteerCall.applications)
  volunteerCall!: VolunteerCall;

  @Column({ type: 'varchar', length: 300 })
  message!: string;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status!: ApplicationStatus;

  @CreateDateColumn()
  appliedAt!: Date;

  // 1:1 inverse — @JoinColumn lives on assignment
  @OneToOne(() => Assignment, (assignment) => assignment.application)
  assignment!: Assignment;
}
