// Body for PUT /ngo/profile. Same rules as signup minus email/password,
// which are credentials and are not editable from the profile route.
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateNgoProfileDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  orgName!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  regNumber!: string;

  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  phone!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  fullName?: string;
}
