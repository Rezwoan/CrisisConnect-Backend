import { IsEnum, IsNotEmpty } from 'class-validator';
import { CrisisStatus } from '../admin.enums';

export class UpdateCrisisStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(CrisisStatus, {
    message: 'Status must be a valid CrisisStatus value',
  })
  status!: CrisisStatus;
}
