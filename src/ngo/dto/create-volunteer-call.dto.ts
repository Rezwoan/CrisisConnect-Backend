// Body for POST /ngo/volunteer-call. crisisId is a plain id: the service
// looks the crisis up and 404s if it does not exist.
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateVolunteerCallDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsInt()
  // IsPositive = greater than 0, so a call must offer at least 1 slot.
  @IsPositive()
  slots!: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  city!: string;

  @IsNotEmpty()
  @IsInt()
  crisisId!: number;
}
