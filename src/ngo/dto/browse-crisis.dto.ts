import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CrisisStatus } from '../../admin/admin.enums';

// Query filters for GET /ngo/crisis. All optional — no filter means "all".
// status is validated against the enum so a bad value returns 400 instead
// of blowing up in Postgres.
// @IsOptional() lets a filter be left out of the URL; when it is left
// out the service simply does not add it to the where clause.
export class BrowseCrisisDto {
  @IsOptional()
  @IsEnum(CrisisStatus)
  status?: CrisisStatus;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
