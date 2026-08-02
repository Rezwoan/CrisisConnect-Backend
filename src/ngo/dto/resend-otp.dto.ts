// Body for POST /ngo/resend-otp. Only the email — the code is generated
// server-side, never supplied by the client.
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
