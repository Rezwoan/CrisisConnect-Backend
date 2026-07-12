import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminDto, UpdateAdminStatusDto } from './admin.dto';
import { Admin } from './admin.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  async createAdmin(@Body() adminDto: AdminDto): Promise<Admin> {
    return await this.adminService.createAdmin(adminDto);
  }

  @Put('update-status/:id')
  @UsePipes(new ValidationPipe())
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminStatusDto: UpdateAdminStatusDto,
  ): Promise<Admin> {
    return await this.adminService.updateStatus(
      id,
      updateAdminStatusDto.status,
    );
  }

  @Get('inactive')
  async getInactiveUsers(): Promise<Admin[]> {
    return await this.adminService.getInactiveUsers();
  }

  @Get('over-40')
  async getUsersOver40(): Promise<Admin[]> {
    return await this.adminService.getUsersOver40();
  }
}
