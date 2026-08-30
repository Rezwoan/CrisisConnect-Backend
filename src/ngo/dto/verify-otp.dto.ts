// Body for verify-otp and verify-login-otp: who is verifying, and the plain
// 6-digit code they were emailed.
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code!: string;
}
