import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class DonorDTO {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name should only contain Alphabets',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^01\d{9}$/, {
    message: 'Phone number must start with 01 and be 11 digits',
  })
  phone: string;
}
