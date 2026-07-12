import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class AdminDto {
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  @IsString({ message: 'Full name must be a string' })
  fullName?: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsNumber({}, { message: 'Age must be a number' })
  age?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive'], {
    message: 'Status must be active or inactive',
  })
  status?: string;
}

export class UpdateAdminStatusDto {
  @IsNotEmpty({ message: 'Status cannot be empty' })
  @IsEnum(['active', 'inactive'], {
    message: 'Status must be active or inactive',
  })
  status: string;
}
