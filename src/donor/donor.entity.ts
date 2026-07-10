import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity("donor")
export class DonorEntity{
@PrimaryGeneratedColumn()
id!: number;
@Column()
name!: string;
@Column()
email!: string;
@Column()
password!: string;
}
