// Query filter for GET /ngo/volunteer-call/:id/applicants.
import { IsEnum, IsOptional } from 'class-validator';
import { ApplicationStatus } from '../../volunteer/volunteer.enums';

export class BrowseApplicantDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
