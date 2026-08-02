import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Volunteer } from './volunteer.entity';

@Entity('skill')
export class Skill {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 40, unique: true })
  name!: string;

  // M:N inverse — @JoinTable lives on volunteer
  @ManyToMany(() => Volunteer, (volunteer) => volunteer.skills)
  volunteers!: Volunteer[];
}


