import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../common/config/multer.config';
import { NgoService } from './ngo.service';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { LoginDto } from './dto/login.dto';
import { NgoGuard, JwtPayload } from './ngo.guard';
import { UpdateNgoProfileDto } from './dto/update-ngo-profile.dto';
import { UpdateActiveStatusDto } from './dto/update-active-status.dto';
import { BrowseCrisisDto } from './dto/browse-crisis.dto';
import { CreateVolunteerCallDto } from './dto/create-volunteer-call.dto';
import { UpdateVolunteerCallDto } from './dto/update-volunteer-call.dto';
import { UpdateVolunteerCallStatusDto } from './dto/update-volunteer-call-status.dto';
import { BrowseVolunteerCallDto } from './dto/browse-volunteer-call.dto';
import { CreateDonationCallDto } from './dto/create-donation-call.dto';
import { UpdateDonationCallStatusDto } from './dto/update-donation-call-status.dto';
import { BrowseDonationCallDto } from './dto/browse-donation-call.dto';
import { BrowseApplicantDto } from './dto/browse-applicant.dto';
import { BrowseAssignmentDto } from './dto/browse-assignment.dto';

// HTTP entry point for the NGO role (User Category 2). Every method is thin
// on purpose: read the request, hand it to the service, return the result.
// All business logic and all database access live in NgoService.
// Guarded routes get the caller's identity from the JWT via NgoGuard, so no
// route ever trusts an id sent by the client to decide "who am I".
@Controller('ngo')
export class NgoController {
  constructor(private readonly ngoService: NgoService) {}

  // Registers a new NGO. Open (no guard) — you cannot have a token yet.
  @Post('signup')
  signup(@Body() dto: CreateNgoDto) {
    return this.ngoService.signup(dto);
  }

  // Confirms the emailed signup code and marks the account verified.
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.ngoService.verifyOtp(dto);
  }

  // Emails a fresh signup code, for when the first one expired.
  @Post('resend-otp')
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.ngoService.resendOtp(dto);
  }

  // Step 1 of login: checks the password, then emails a login code.
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.ngoService.login(dto);
  }

  // Step 2 of login: confirms the code and returns the JWT.
  @Post('verify-login-otp')
  verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.ngoService.verifyLoginOtp(dto);
  }

  // Returns the caller's own profile — no :id, the token says who you are.
  @Get('profile')
  @UseGuards(NgoGuard)
  getProfile(@Req() req: { user: JwtPayload }) {
    return this.ngoService.getProfile(req.user.userId);
  }

  // Full update of the editable profile fields.
  @Put('profile')
  @UseGuards(NgoGuard)
  updateProfile(
    @Req() req: { user: JwtPayload },
    @Body() dto: UpdateNgoProfileDto,
  ) {
    return this.ngoService.updateProfile(req.user.userId, dto);
  }

  // Flips only isActive — PATCH because it is a partial change.
  @Patch('profile/active')
  @UseGuards(NgoGuard)
  updateActiveStatus(
    @Req() req: { user: JwtPayload },
    @Body() dto: UpdateActiveStatusDto,
  ) {
    return this.ngoService.updateActiveStatus(req.user.userId, dto);
  }

  // Lists all crises with optional status/city/category filters.
  @Get('crisis')
  @UseGuards(NgoGuard)
  browseCrises(@Query() query: BrowseCrisisDto) {
    return this.ngoService.browseCrises(query);
  }

  // Lists only the crises this NGO has joined (the M:N side).
  @Get('my-crises')
  @UseGuards(NgoGuard)
  getMyCrises(@Req() req: { user: JwtPayload }) {
    return this.ngoService.getMyCrises(req.user.userId);
  }

  // M:N attach — adds a row to the crisis_participation join table.
  @Post('crisis/:crisisId/join')
  @UseGuards(NgoGuard)
  joinCrisis(
    @Req() req: { user: JwtPayload },
    @Param('crisisId', ParseIntPipe) crisisId: number,
  ) {
    return this.ngoService.joinCrisis(req.user.userId, crisisId);
  }

  // M:N detach — removes that join-table row.
  @Delete('crisis/:crisisId/leave')
  @UseGuards(NgoGuard)
  leaveCrisis(
    @Req() req: { user: JwtPayload },
    @Param('crisisId', ParseIntPipe) crisisId: number,
  ) {
    return this.ngoService.leaveCrisis(req.user.userId, crisisId);
  }

  // 1:N create — a volunteer call belonging to this NGO, under one crisis.
  @Post('volunteer-call')
  @UseGuards(NgoGuard)
  createVolunteerCall(
    @Req() req: { user: JwtPayload },
    @Body() dto: CreateVolunteerCallDto,
  ) {
    return this.ngoService.createVolunteerCall(req.user.userId, dto);
  }

  // Lists this NGO's own calls, with optional status/crisisId/city filters.
  @Get('volunteer-call')
  @UseGuards(NgoGuard)
  browseVolunteerCalls(
    @Req() req: { user: JwtPayload },
    @Query() query: BrowseVolunteerCallDto,
  ) {
    return this.ngoService.browseVolunteerCalls(req.user.userId, query);
  }

  // Full update of one own call. ParseIntPipe rejects a non-numeric :id.
  @Put('volunteer-call/:id')
  @UseGuards(NgoGuard)
  updateVolunteerCall(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVolunteerCallDto,
  ) {
    return this.ngoService.updateVolunteerCall(req.user.userId, id, dto);
  }

  // Flips a call between OPEN and CLOSED.
  @Patch('volunteer-call/:id/status')
  @UseGuards(NgoGuard)
  updateVolunteerCallStatus(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVolunteerCallStatusDto,
  ) {
    return this.ngoService.updateVolunteerCallStatus(req.user.userId, id, dto);
  }

  // Deletes one own call.
  @Delete('volunteer-call/:id')
  @UseGuards(NgoGuard)
  deleteVolunteerCall(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ngoService.deleteVolunteerCall(req.user.userId, id);
  }

  // 1:N create — a fundraising call under one crisis.
  @Post('donation-call')
  @UseGuards(NgoGuard)
  createDonationCall(
    @Req() req: { user: JwtPayload },
    @Body() dto: CreateDonationCallDto,
  ) {
    return this.ngoService.createDonationCall(req.user.userId, dto);
  }

  // Lists this NGO's own donation calls, filtered by status/crisisId.
  @Get('donation-call')
  @UseGuards(NgoGuard)
  browseDonationCalls(
    @Req() req: { user: JwtPayload },
    @Query() query: BrowseDonationCallDto,
  ) {
    return this.ngoService.browseDonationCalls(req.user.userId, query);
  }

  // Flips a donation call between OPEN and CLOSED.
  @Patch('donation-call/:id/status')
  @UseGuards(NgoGuard)
  updateDonationCallStatus(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDonationCallStatusDto,
  ) {
    return this.ngoService.updateDonationCallStatus(req.user.userId, id, dto);
  }

  // Lists who applied to one of this NGO's calls (reads Volunteer's table).
  @Get('volunteer-call/:id/applicants')
  @UseGuards(NgoGuard)
  getApplicants(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Query() query: BrowseApplicantDto,
  ) {
    return this.ngoService.getApplicants(req.user.userId, id, query);
  }

  // 1:1 create — approving an application produces exactly one assignment.
  @Post('application/:id/approve')
  @UseGuards(NgoGuard)
  approveApplication(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ngoService.approveApplication(req.user.userId, id);
  }

  // Marks an application REJECTED — no assignment is created.
  @Patch('application/:id/reject')
  @UseGuards(NgoGuard)
  rejectApplication(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ngoService.rejectApplication(req.user.userId, id);
  }

  // Lists this NGO's assignments, filtered by status/volunteerCallId.
  @Get('assignment')
  @UseGuards(NgoGuard)
  browseAssignments(
    @Req() req: { user: JwtPayload },
    @Query() query: BrowseAssignmentDto,
  ) {
    return this.ngoService.browseAssignments(req.user.userId, query);
  }

  // Marks an assignment COMPLETED once the volunteer has finished.
  @Patch('assignment/:id/complete')
  @UseGuards(NgoGuard)
  completeAssignment(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ngoService.completeAssignment(req.user.userId, id);
  }

  // Uploads a profile picture. FileInterceptor + multer config handle the
  // file type/size rules and save it into uploads/ngo.
  @Post('profile/image')
  @UseGuards(NgoGuard)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions('ngo')))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: JwtPayload },
  ) {
    return this.ngoService.uploadProfileImage(req.user.userId, file?.filename);
  }
}
