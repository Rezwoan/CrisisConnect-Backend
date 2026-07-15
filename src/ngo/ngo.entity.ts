import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { randomUUID } from 'crypto';

// Lab Task 3 starter entity for the NGO role (User Category 2).
// Real NGO fields (orgName, email, password, address, createdByAdminId,
// etc.) get added later — see Build Order phase 06 in the design doc.
@Entity()
export class Ngo {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fullName: string | null;

  // Postgres has no "bigint unsigned" type either. bigint is used as
  // required by the assignment. TypeORM returns bigint values as strings
  // in JS to avoid precision loss, so the property type is string here,
  // not number.
  @Column({ type: 'bigint' })
  phone: string;

  @BeforeInsert()
  generateId() {
    this.id = randomUUID();
  }
}
