import { Controller, Get } from '@nestjs/common';
import { VolunteerService } from './volunteer.service';

// Base HTTP entry point for the Volunteer role (User Category 3).
// File uploads for this role go into its own uploads/volunteer folder —
// implement the upload/download endpoints here when needed.
@Controller('volunteer')
export class VolunteerController {
  constructor(private readonly volunteerService: VolunteerService) {}

  // Confirms the Volunteer module is wired up and working.
  @Get()
  getStatus(): string {
    return this.volunteerService.getStatus();
  }
}
