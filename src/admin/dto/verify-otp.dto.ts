import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsNotEmpty({ message: 'OTP code is required' })
  @IsString({ message: 'OTP code must be a string' })
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  code!: string;
}
