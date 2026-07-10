import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import { randomUUID } from 'crypto';

// Lab Task 3 starter entity for the Donor role (User Category 4).
// Real Donor fields (name, email, password, totalDonated, etc.) get
// added later — see Build Order phase 06 in the design doc.
@Entity()
export class Donor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  uniqueId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joiningDate: Date;

  @Column({ type: 'varchar', length: 30, default: 'Unknown' })
  country: string;

  @BeforeInsert()
  generateUniqueId() {
    this.uniqueId = randomUUID();
  }
}
