import { IsEnum, IsNotEmpty } from 'class-validator';
import { AdminStatus } from '../admin.enums';

export class UpdateAdminStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(AdminStatus, { message: 'Status must be a valid AdminStatus value' })
  status!: AdminStatus;
}
