// Body for PUT /ngo/volunteer-call/:id.
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

// No crisisId — a call stays under the crisis it was created for.
export class UpdateVolunteerCallDto {
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
}
