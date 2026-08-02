// Body for PATCH /ngo/donation-call/:id/status.
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DonationCallStatus } from '../ngo.enums';

export class UpdateDonationCallStatusDto {
  @IsNotEmpty()
  @IsEnum(DonationCallStatus)
  status!: DonationCallStatus;
}
