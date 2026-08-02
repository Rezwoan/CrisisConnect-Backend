// Body for PATCH /ngo/volunteer-call/:id/status. @IsEnum keeps a bad value
// out of Postgres, which would otherwise fail the enum cast as a 500.
import { IsEnum, IsNotEmpty } from 'class-validator';
import { VolunteerCallStatus } from '../ngo.enums';

export class UpdateVolunteerCallStatusDto {
  @IsNotEmpty()
  @IsEnum(VolunteerCallStatus)
  status!: VolunteerCallStatus;
}
