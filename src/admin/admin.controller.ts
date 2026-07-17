import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

// Base HTTP entry point for the Admin role (User Category 1).
// File uploads for this role go into its own uploads/admin folder —
// implement the upload/download endpoints here when needed.
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Confirms the Admin module is wired up and working.
  @Get()
  getStatus(): string {
    return this.adminService.getStatus();
  }
}
