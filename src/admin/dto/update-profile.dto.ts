import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  fullName!: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phone!: string;

  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  city!: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsInt({ message: 'Age must be an integer' })
  @Min(18, { message: 'Age must be at least 18' })
  age!: number;
}
