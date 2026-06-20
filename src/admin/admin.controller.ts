import { Controller, Get, Param, Query } from '@nestjs/common';
import {AdminService} from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Query('role') role?: string, @Query('isActive') isActive?: string) {
    return this.adminService.getUsers(role, isActive);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: number) {
    return this.adminService.getUserById(id);
  }

  @Get('organizations')
  getOrganizations(@Query('status') status?: string) {
    return this.adminService.getOrganizations(status);
  }

  @Get('organizations/:id')
  getOrganizationById(@Param('id') id: number) {
    return this.adminService.getOrganizationById(id);
  }
}
