import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { VolunteerCallStatus } from '../ngo.enums';

// Query filters for GET /ngo/volunteer-call. Query params always arrive as
// strings, so crisisId is validated as a numeric string and converted in
// the service.
export class BrowseVolunteerCallDto {
  @IsOptional()
  @IsEnum(VolunteerCallStatus)
  status?: VolunteerCallStatus;

  @IsOptional()
  // Query values always arrive as text, so this regex just says
  // "digits only". The service turns it into a number.
  @Matches(/^\d+$/)
  crisisId?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
