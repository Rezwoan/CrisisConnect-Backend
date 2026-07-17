import { Controller, Get } from '@nestjs/common';
import { DonorService } from './donor.service';

// Base HTTP entry point for the Donor role (User Category 4).
// File uploads for this role go into its own uploads/donor folder —
// implement the upload/download endpoints here when needed.
@Controller('donor')
export class DonorController {
  constructor(private readonly donorService: DonorService) {}

  // Confirms the Donor module is wired up and working.
  @Get()
  getStatus(): string {
    return this.donorService.getStatus();
  }
}
