import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CrisisSeverity } from '../admin.enums';

export class CreateCrisisDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title!: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  description!: string;

  @IsNotEmpty({ message: 'Category is required' })
  @IsString({ message: 'Category must be a string' })
  category!: string;

  @IsNotEmpty({ message: 'Severity is required' })
  @IsEnum(CrisisSeverity, {
    message: 'Severity must be a valid CrisisSeverity value',
  })
  severity!: CrisisSeverity;

  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  city!: string;
}
