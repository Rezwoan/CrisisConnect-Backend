import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ): object {
    return this.adminService.getUsers(role, isActive);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: number): object {
    return this.adminService.getUserById(id);
  }

  @Get('organizations')
  getOrganizations(@Query('status') status?: string): object {
    return this.adminService.getOrganizations(status);
  }

  @Get('organizations/:id')
  getOrganizationById(@Param('id') id: number): object {
    return this.adminService.getOrganizationById(id);
  }
}
