// Body for POST /ngo/signup. class-validator checks each rule before the
// controller runs, so the service can trust every field it receives.
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateNgoDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 50)
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password!: string;

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

  // @IsOptional() (from the class-validator docs) means: if this field is
  // missing, skip the other checks. Without it a missing fullName would
  // fail validation, and the column is nullable in the entity.
  @IsOptional()
  @IsString()
  @MaxLength(60)
  fullName?: string;
}
