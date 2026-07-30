import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateNgoDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  orgName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  regNumber!: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  fullName?: string;
}
