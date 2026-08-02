import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Assignment } from '../../ngo/entities/assignment.entity';

@Entity('work_log')
export class WorkLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.workLogs)
  assignment!: Assignment;

  @Column({ type: 'int' })
  hours!: number;

  @Column({ type: 'varchar', length: 300 })
  note!: string;

  @CreateDateColumn()
  loggedAt!: Date;
}


