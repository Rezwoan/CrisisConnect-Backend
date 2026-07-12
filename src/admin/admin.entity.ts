import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id?: number;
  @Column({ type: 'varchar', length: 100 })
  fullName?: string;
  @Column({ type: 'int', unsigned: true })
  age?: number;
  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status?: string;
}
