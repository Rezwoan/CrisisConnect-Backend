// Body for POST /ngo/donation-call.
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateDonationCallDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  // decimal(12,2) — Postgres hands decimals back as strings, so keep it a
  // string end to end rather than risking float rounding on money.
  @IsNotEmpty()
  // Digits, optionally a dot and up to 2 decimals — e.g. "50000.00".
  @Matches(/^\d+(\.\d{1,2})?$/)
  targetAmount!: string;

  @IsNotEmpty()
  @IsInt()
  crisisId!: number;
}
