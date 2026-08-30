import {
  BadRequestException,
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
import { ApplicationStatus } from './volunteer.enums';
import { VolunteerService } from './volunteer.service';
import {
  AvailabilityDto,
  ApplyTaskDto,
  CreateVolunteerDto,
  LoginDto,
  SkillDto,
  UpdateVolunteerDto,
  VerifyOtpDto,
  WorkLogDto,
} from './volunteer.dto';

@Controller('volunteer')
export class VolunteerController {
  constructor(
    @Inject(VolunteerService)
    private readonly volunteerService: VolunteerService,
  ) {}

  private getVolunteerId(req: any): number {
    return Number(req.user?.volunteerId ?? req.volunteer?.id ?? req.user?.id);
  }

  private parseOptionalBoolean(value?: string): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    throw new BadRequestException('isAvailable must be either true or false');
  }

  private parseOptionalNumber(
    value: string | undefined,
    fieldName: string,
  ): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`${fieldName} must be a valid number`);
    }

    return parsed;
  }

  private parseOptionalApplicationStatus(
    value?: string,
  ): ApplicationStatus | undefined {
    if (value === undefined) {
      return undefined;
    }

    if ((Object.values(ApplicationStatus) as string[]).includes(value)) {
      return value as ApplicationStatus;
    }

    throw new BadRequestException(
      'status must be one of PENDING, APPROVED, REJECTED',
    );
  }

  // ============================================================
  // 1. Health Check
  // ============================================================

  @Get()
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
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.uploadProfileImage(
      volunteerId,
      file?.filename,
    );
  }

  // 3.2 Get Logged-in Volunteer Profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.getProfile(volunteerId);
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
  updateProfile(@Req() req: any, @Body() body: UpdateVolunteerDto) {
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.updateProfile(volunteerId, body);
  }

  // 3.5 Delete Volunteer by ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteVolunteer(@Param('id') id: string) {
    return this.volunteerService.deleteVolunteer(Number(id));
  }

  // 3.6 Update Availability Status
  @Patch('profile/availability')
  @UseGuards(JwtAuthGuard)
  updateAvailability(@Req() req: any, @Body() body: AvailabilityDto) {
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.updateAvailability(
      volunteerId,
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
    @Query('isAvailable') isAvailable?: string,
    @Query('skill') skill?: string,
  ) {
    const parsedIsAvailable = this.parseOptionalBoolean(isAvailable);
    return this.volunteerService.searchVolunteer(
      city,
      parsedIsAvailable,
      skill,
    );
  }

  // ============================================================
  // 5. Skill Management
  // ============================================================

  // 5.1 Create New Skill
  @Post('skill')
  @UseGuards(JwtAuthGuard)
  createSkill(@Body() body: SkillDto) {
    return this.volunteerService.createSkill(body.name);
  }

  // 5.2 Add Skill to Logged-in Volunteer
  @Post('me/skill/:skillId')
  @UseGuards(JwtAuthGuard)
  addSkill(@Req() req: any, @Param('skillId') skillId: number) {
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.addSkill(volunteerId, +skillId);
  }

  // 5.3 Remove Skill
  @Delete('me/skill/:skillId')
  @UseGuards(JwtAuthGuard)
  removeSkill(@Req() req: any, @Param('skillId') skillId: number) {
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.removeSkill(volunteerId, +skillId);
  }

  // 5.4 Get My Skills
  @Get('me/skill')
  @UseGuards(JwtAuthGuard)
  getMySkills(@Req() req: any) {
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.getMySkills(volunteerId);
  }

  // ============================================================
  // 6. Volunteer Calls
  // ============================================================

  // 6.1 Get Available Volunteer Calls
  @Get('calls')
  @UseGuards(JwtAuthGuard)
  getVolunteerCalls(
    @Query('city') city?: string,
    @Query('crisisId') crisisId?: string,
    @Query('status') status?: string,
  ) {
    const parsedCrisisId = this.parseOptionalNumber(crisisId, 'crisisId');
    return this.volunteerService.getVolunteerCalls(
      city,
      parsedCrisisId,
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
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.apply(volunteerId, dto);
  }

  // 7.2 Get My Applications
  @Get('application')
  @UseGuards(JwtAuthGuard)
  getApplications(@Req() req: any, @Query('status') status?: string) {
    const volunteerId = this.getVolunteerId(req);
    const parsedStatus = this.parseOptionalApplicationStatus(status);
    return this.volunteerService.getApplications(volunteerId, parsedStatus);
  }

  // 7.3 Delete an Application
  @Delete('application/:id')
  @UseGuards(JwtAuthGuard)
  deleteApplication(@Req() req: any, @Param('id') id: number) {
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.deleteApplication(volunteerId, +id);
  }

  // ============================================================
  // 8. Assignment Management
  // ============================================================

  // 8.1 Get My Assignments
  @Get('assignment')
  @UseGuards(JwtAuthGuard)
  getAssignments(@Req() req: any) {
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.getAssignments(volunteerId);
  }

  // ============================================================
  // 9. Work Log Management
  // ============================================================

  // 9.1 Create Work Log
  @Post('work-log')
  @UseGuards(JwtAuthGuard)
  createWorkLog(@Req() req: any, @Body() body: WorkLogDto) {
    const volunteerId = this.getVolunteerId(req);
    return this.volunteerService.createWorkLog(volunteerId, body);
  }

  // 9.2 Get Work Logs
  @Get('work-log')
  @UseGuards(JwtAuthGuard)
  getWorkLogs(
    @Req() req: any,
    @Query('assignmentId') assignmentId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const volunteerId = this.getVolunteerId(req);
    const parsedAssignmentId = this.parseOptionalNumber(
      assignmentId,
      'assignmentId',
    );

    return this.volunteerService.getWorkLogs(
      volunteerId,
      parsedAssignmentId,
      from,
      to,
    );
  }

  // 4.2 Get Volunteer by Username
  @Get(':username')
  @UseGuards(JwtAuthGuard)
  getVolunteer(@Param('username') username: string) {
    return this.volunteerService.getVolunteerByUsername(username);
  }
}
