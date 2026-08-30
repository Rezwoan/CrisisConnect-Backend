// Query filters for GET /ngo/assignment.
import { IsEnum, IsOptional, Matches } from 'class-validator';
import { AssignmentStatus } from '../ngo.enums';

export class BrowseAssignmentDto {
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsOptional()
  // Query values always arrive as text, so this regex just says
  // "digits only". The service turns it into a number.
  @Matches(/^\d+$/)
  volunteerCallId?: string;
}
