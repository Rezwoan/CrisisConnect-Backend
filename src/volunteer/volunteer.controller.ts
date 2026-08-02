import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../common/config/multer.config';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { VolunteerService } from './volunteer.service';
import {
  ApplyTaskDto,
  CreateVolunteerDto,
  LoginDto,
  VerifyOtpDto,
} from './volunteer.dto';

@Controller('volunteer')
export class VolunteerController {
  constructor(
    @Inject(VolunteerService)
    private readonly volunteerService: VolunteerService,
  ) {}

  // ============================================================
  // 1. Health Check
  // ============================================================

  @Get()
  @UseGuards(JwtAuthGuard)
  getStatus(): string {
    return this.volunteerService.getStatus();
  }

  // ============================================================
  // 2. Authentication (Signup, Login & OTP)
  // ============================================================

  // 2.1 Volunteer Signup
  @Post('signup')
  signup(@Body() dto: CreateVolunteerDto) {
    return this.volunteerService.signup(dto);
  }

  // 2.2 Volunteer Login
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.volunteerService.login(dto);
  }

  // 2.3 Verify Signup OTP
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.volunteerService.verifyOtp(dto);
  }

  // 2.4 Verify Login OTP
  @Post('verify-login-otp')
  verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.volunteerService.verifyLoginOtp(dto);
  }

  // ============================================================
  // 3. Profile Management
  // ============================================================

  // 3.1 Upload Profile Image
  @Post('profile/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions('volunteer')))
  uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.uploadProfileImage(userId, file?.filename);
  }

  // 3.2 Get Logged-in Volunteer Profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.getProfile(userId);
  }

  // 3.3 Get Volunteer Profile by ID
  @Get('profile/:id')
  @UseGuards(JwtAuthGuard)
  getProfileById(@Param('id') id: string) {
    return this.volunteerService.getProfile(Number(id));
  }

  // 3.4 Update Volunteer Profile
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.updateProfile(userId, body);
  }

  // 3.5 Update Availability Status
  @Patch('profile/availability')
  @UseGuards(JwtAuthGuard)
  updateAvailability(
    @Req() req: any,
    @Body() body: { isAvailable: boolean },
  ) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.updateAvailability(
      userId,
      body.isAvailable,
    );
  }

  // ============================================================
  // 4. Volunteer Search
  // ============================================================

  // 4.1 Search Volunteers
  @Get('search')
  @UseGuards(JwtAuthGuard)
  searchVolunteer(
    @Query('city') city?: string,
    @Query('isAvailable') isAvailable?: boolean,
    @Query('skill') skill?: string,
  ) {
    return this.volunteerService.searchVolunteer(city, isAvailable, skill);
  }

  // 4.2 Get Volunteer by Username
  @Get(':username')
  @UseGuards(JwtAuthGuard)
  getVolunteer(@Param('username') username: string) {
    return this.volunteerService.getVolunteerByUsername(username);
  }

  // ============================================================
  // 5. Skill Management
  // ============================================================

  // 5.1 Create New Skill
  @Post('skill')
  @UseGuards(JwtAuthGuard)
  createSkill(@Body() body: { name: string }) {
    return this.volunteerService.createSkill(body.name);
  }

  // 5.2 Add Skill to Logged-in Volunteer
  @Post('me/skill/:skillId')
  @UseGuards(JwtAuthGuard)
  addSkill(@Req() req: any, @Param('skillId') skillId: number) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.addSkill(userId, +skillId);
  }

  // 5.3 Remove Skill
  @Delete('me/skill/:skillId')
  @UseGuards(JwtAuthGuard)
  removeSkill(@Req() req: any, @Param('skillId') skillId: number) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.removeSkill(userId, +skillId);
  }

  // 5.4 Get My Skills
  @Get('me/skill')
  @UseGuards(JwtAuthGuard)
  getMySkills(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.getMySkills(userId);
  }

  // ============================================================
  // 6. Volunteer Calls
  // ============================================================

  // 6.1 Get Available Volunteer Calls
  @Get('calls')
  @UseGuards(JwtAuthGuard)
  getVolunteerCalls(
    @Query('city') city?: string,
    @Query('crisisId') crisisId?: number,
    @Query('status') status?: string,
  ) {
    return this.volunteerService.getVolunteerCalls(
      city,
      crisisId,
      status,
    );
  }

  // ============================================================
  // 7. Volunteer Applications
  // ============================================================

  // 7.1 Apply for a Task
  @Post('application')
  @UseGuards(JwtAuthGuard)
  apply(@Req() req: any, @Body() dto: ApplyTaskDto) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.apply(userId, dto);
  }

  // 7.2 Get My Applications
  @Get('application')
  @UseGuards(JwtAuthGuard)
  getApplications(
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.getApplications(userId, status);
  }

  // 7.3 Delete an Application
  @Delete('application/:id')
  @UseGuards(JwtAuthGuard)
  deleteApplication(@Req() req: any, @Param('id') id: number) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.deleteApplication(userId, +id);
  }

  // ============================================================
  // 8. Assignment Management
  // ============================================================

  // 8.1 Get My Assignments
  @Get('assignment')
  @UseGuards(JwtAuthGuard)
  getAssignments(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.getAssignments(userId);
  }

  // ============================================================
  // 9. Work Log Management
  // ============================================================

  // 9.1 Create Work Log
  @Post('work-log')
  @UseGuards(JwtAuthGuard)
  createWorkLog(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id ?? req.user?.userId;
    return this.volunteerService.createWorkLog(userId, body);
  }

  // 9.2 Get Work Logs
  @Get('work-log')
  @UseGuards(JwtAuthGuard)
  getWorkLogs(
    @Req() req: any,
    @Query('assignmentId') assignmentId?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const userId = req.user?.id ?? req.user?.userId;

    return this.volunteerService.getWorkLogs(
      userId,
      assignmentId !== undefined ? +assignmentId : undefined,
      from,
      to,
    );
  }
}