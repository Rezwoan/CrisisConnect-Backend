// Query filters for GET /ngo/donation-call.
import { IsEnum, IsOptional, Matches } from 'class-validator';
import { DonationCallStatus } from '../ngo.enums';

export class BrowseDonationCallDto {
  @IsOptional()
  @IsEnum(DonationCallStatus)
  status?: DonationCallStatus;

  @IsOptional()
  // Query values always arrive as text, so this regex just says
  // "digits only". The service turns it into a number.
  @Matches(/^\d+$/)
  crisisId?: string;
}
