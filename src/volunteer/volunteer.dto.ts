import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateVolunteerDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @MaxLength(100)
  username: string;

  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  @MaxLength(150)
  fullName: string;
}
