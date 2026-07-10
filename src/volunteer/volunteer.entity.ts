import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { randomUUID } from 'crypto';

// Lab Task 3 starter entity for the Volunteer role (User Category 3).
// Real Volunteer fields (email, password, bio, availability, etc.) get
// added later — see Build Order phase 06 in the design doc.
@Entity()
export class Volunteer {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @BeforeInsert()
  generateId() {
    this.id = randomUUID();
  }
}
