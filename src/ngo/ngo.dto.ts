import {
  IsNotEmpty,
  IsString,
  Matches,
  IsDateString,
  IsUrl,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NgoDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[^0-9]+$/, {
    message: 'Name should not contain any numbers',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/[@#$&]/, {
    message:
      'Password must contain at least one special character (@ or # or $ or &)',
  })
  password: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsUrl(
    {},
    {
      message: 'Social media link must be a valid URL',
    },
  )
  socialMediaLink: string;
}

// User Category 2 DTOs — these map to the `ngo` table (see ngo.entity.ts).
export class CreateNgoUserDto {
  // fullName is nullable in the schema, so it is optional here too.
  @IsOptional()
  @IsString()
  fullName?: string;

  // Postgres bigint is signed, so the "unsigned" part of the schema
  // requirement is enforced here with Min(0).
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt({ message: 'Phone must be a whole number' })
  @Min(0, { message: 'Phone must be unsigned (0 or greater)' })
  phone: number;
}

export class UpdateNgoUserPhoneDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt({ message: 'Phone must be a whole number' })
  @Min(0, { message: 'Phone must be unsigned (0 or greater)' })
  phone: number;
}
