import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title!: string;

  @IsNotEmpty({ message: 'Body is required' })
  @IsString({ message: 'Body must be a string' })
  body!: string;

  @IsOptional()
  @IsBoolean({ message: 'isUrgent must be a boolean' })
  isUrgent?: boolean;

  @IsNotEmpty({ message: 'Recipient User IDs are required' })
  @IsArray({ message: 'recipientUserIds must be an array of user IDs' })
  recipientUserIds!: number[];
}
