import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { imageUploadOptions } from '../common/config/multer.config';

import { CreateAdminDto } from './dto/admin.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAdminStatusDto } from './dto/update-status.dto';
import { CreateCrisisDto } from './dto/create-crisis.dto';
import { UpdateCrisisStatusDto } from './dto/update-crisis-status.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

import { UserRole } from '../common/common.enums';
import { AdminStatus, CrisisStatus, CrisisSeverity } from './admin.enums';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Healthcheck
  @Get()
  getStatus(): string {
    return this.adminService.getStatus();
  }

  // --- Auth Routes ---
  @Post('signup')
  signup(@Body() dto: CreateAdminDto) {
    return this.adminService.signup(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.adminService.verifyOtp(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.adminService.login(dto);
  }

  @Post('verify-login-otp')
  @HttpCode(HttpStatus.OK)
  verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.adminService.verifyLoginOtp(dto);
  }

  // --- Task 0: Profile Image ---
  @Post('profile/image')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions('admin')))
  uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.adminService.uploadProfileImage(
      req.user?.userId,
      file?.filename,
    );
  }

  // --- Profile Routes ---
  @Get('profile')
  @UseGuards(AdminGuard)
  getProfile(@Req() req: any) {
    return this.adminService.getProfile(req.user?.userId);
  }

  @Put('profile')
  @UseGuards(AdminGuard)
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.adminService.updateProfile(req.user?.userId, dto);
  }

  @Patch('profile/status')
  @UseGuards(AdminGuard)
  updateProfileStatus(@Req() req: any, @Body() dto: UpdateAdminStatusDto) {
    return this.adminService.updateProfileStatus(req.user?.userId, dto);
  }

  // --- User Management ---
  @Get('users')
  @UseGuards(AdminGuard)
  getUsers(
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: string,
    @Query('city') city?: string,
    @Query('search') search?: string,
  ) {
    const activeBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.adminService.getUsers({
      role,
      isActive: activeBool,
      city,
      search,
    });
  }

  @Patch('users/:id/deactivate')
  @UseGuards(AdminGuard)
  deactivateUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deactivateUser(id);
  }

  // --- Phase 5 & 6/7: Crisis CRUD ---
  @Post('crisis')
  @UseGuards(AdminGuard)
  createCrisis(@Req() req: any, @Body() dto: CreateCrisisDto) {
    return this.adminService.createCrisis(req.user?.userId, dto);
  }

  @Get('crisis')
  @UseGuards(AdminGuard)
  getCrises(
    @Query('status') status?: CrisisStatus,
    @Query('severity') severity?: CrisisSeverity,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    return this.adminService.getCrises({ status, severity, category, city });
  }

  @Get('crisis/:id')
  @UseGuards(AdminGuard)
  getCrisisById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCrisisById(id);
  }

  @Put('crisis/:id')
  @UseGuards(AdminGuard)
  updateCrisis(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateCrisisDto>,
  ) {
    return this.adminService.updateCrisis(id, dto);
  }

  @Patch('crisis/:id/status')
  @UseGuards(AdminGuard)
  updateCrisisStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCrisisStatusDto,
  ) {
    return this.adminService.updateCrisisStatus(id, dto);
  }

  @Delete('crisis/:id')
  @UseGuards(AdminGuard)
  deleteCrisis(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCrisis(id);
  }

  // --- Phase 8: Announcements ---
  @Post('announcement')
  @UseGuards(AdminGuard)
  createAnnouncement(@Req() req: any, @Body() dto: CreateAnnouncementDto) {
    return this.adminService.createAnnouncement(req.user?.userId, dto);
  }

  @Get('announcement/:id')
  @UseGuards(AdminGuard)
  getAnnouncementById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getAnnouncementById(id);
  }

  @Delete('announcement/:id/recipient/:userId')
  @UseGuards(AdminGuard)
  removeAnnouncementRecipient(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.adminService.removeAnnouncementRecipient(id, userId);
  }
}
