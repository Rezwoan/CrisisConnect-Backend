import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class AdminDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name should only contain Alphabets',
  })
  name: string;

  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Email must be a valid email address',
    },
  )
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{10}$|^\d{13}$|^\d{17}$/, {
    message: 'Invalid NID format. (Accepted formats: 10, 13, or 17 digits)',
  })
  nidNumber: string;

  fileName: string;
}
