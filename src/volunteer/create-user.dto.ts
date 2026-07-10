import {
  IsEmail,
  Matches,
  MinLength,
  IsIn,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(/@aiub\.edu$/, {
    message: 'Email must be an aiub.edu email',
  })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  password!: string;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsIn(['male', 'female'], {
    message: 'Gender must be either male or female',
  })
  gender!: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9]+$/, {
    message: 'Phone number must contain only numbers',
  })
  phone!: string;
}