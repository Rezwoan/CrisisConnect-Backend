import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Lab Task 3 starter entity for the Admin role (User Category 1).
// Real Admin fields (email, password, designation, createdByAdminId, etc.)
// get added later when we build the actual signup/login version —
// see Build Order phase 02/06 in the design doc.
@Entity()
export class Admin {
  // "unsigned" is a MySQL-only concept. Postgres has no unsigned integer
  // type, so this option is simply ignored by the Postgres driver — it
  // does not throw an error, it just has no real effect. Left in so the
  // code visibly satisfies the assignment.
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'int', unsigned: true })
  age: number;

  // enum column enforces at the database level that status can only ever
  // be 'active' or 'inactive'
  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;
}
