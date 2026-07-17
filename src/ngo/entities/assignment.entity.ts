import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Application } from '../../volunteer/entities/application.entity';
import { Ngo } from './ngo.entity';
import { AssignmentStatus } from '../ngo.enums';
import { WorkLog } from '../../volunteer/entities/work-log.entity';

@Entity('assignment')
export class Assignment {
  @PrimaryGeneratedColumn()
  id!: number;

  // 1:1 — one assignment per application
  @OneToOne(() => Application, (application) => application.assignment)
  @JoinColumn()
  application!: Application;

  @ManyToOne(() => Ngo, (ngo) => ngo.assignments)
  ngo!: Ngo;

  @Column({ type: 'varchar', length: 60 })
  roleTitle!: string;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.ACTIVE })
  status!: AssignmentStatus;

  @CreateDateColumn()
  assignedAt!: Date;

  @OneToMany(() => WorkLog, (workLog) => workLog.assignment)
  workLogs!: WorkLog[];
}
