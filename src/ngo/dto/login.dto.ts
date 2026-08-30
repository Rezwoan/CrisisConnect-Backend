// Body for POST /ngo/login. No strength rules here — login only compares
// against the stored hash; re-checking strength could lock out old passwords.
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
