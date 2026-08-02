import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Ngo } from './entities/ngo.entity';
import { VolunteerCall } from './entities/volunteer-call.entity';
import { DonationCall } from './entities/donation-call.entity';
import { Assignment } from './entities/assignment.entity';
import { Application } from '../volunteer/entities/application.entity';
import { ApplicationStatus } from '../volunteer/volunteer.enums';
import { AssignmentStatus } from './ngo.enums';
import { User } from '../common/entities/user.entity';
import { Otp } from '../common/entities/otp.entity';
import { Crisis } from '../admin/entities/crisis.entity';
import { UserRole, OtpPurpose } from '../common/common.enums';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { LoginDto } from './dto/login.dto';
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

// How long an emailed OTP stays usable.
const OTP_EXPIRY_MINUTES = 10;

// All business logic and database access for the NGO role (User Category 2).
// Each repository below is injected by TypeORM after being registered in
// ngo.module.ts. Crisis and Application belong to the Admin and Volunteer
// roles: we register and read them here rather than editing their folders.
@Injectable()
export class NgoService {
  constructor(
    @InjectRepository(Ngo)
    private readonly ngoRepository: Repository<Ngo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(Crisis)
    private readonly crisisRepository: Repository<Crisis>,
    @InjectRepository(VolunteerCall)
    private readonly volunteerCallRepository: Repository<VolunteerCall>,
    @InjectRepository(DonationCall)
    private readonly donationCallRepository: Repository<DonationCall>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  // Creates the user + ngo rows together, then emails a signup code.
  // The password is only ever stored as a bcrypt hash, never in plain text.
  async signup(dto: CreateNgoDto): Promise<object> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordSalt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, passwordSalt);
    const user = await this.userRepository.save(
      this.userRepository.create({
        email: dto.email,
        passwordHash,
        role: UserRole.NGO,
      }),
    );

    await this.ngoRepository.save(
      this.ngoRepository.create({
        user,
        orgName: dto.orgName,
        regNumber: dto.regNumber,
        phone: dto.phone,
        city: dto.city,
        fullName: dto.fullName,
      }),
    );

    await this.createAndSendOtp(user, OtpPurpose.SIGNUP);

    return { message: 'Signup successful, OTP sent to your email' };
  }

  // Generates a fresh 6-digit code, stores only its hash, and emails the
  // plain code. Shared by signup and resend-otp.
  private async createAndSendOtp(
    user: User,
    purpose: OtpPurpose,
  ): Promise<void> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSalt = await bcrypt.genSalt();
    const codeHash = await bcrypt.hash(otpCode, otpSalt);

    await this.otpRepository.save(
      this.otpRepository.create({
        user,
        codeHash,
        purpose,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      }),
    );

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Your CrisisConnect verification code',
      text: `Your verification code is ${otpCode}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });
  }

  // Issues a replacement signup code. Without this an expired code would
  // lock the account out for good: signup 409s and verify-otp 400s forever.
  async resendOtp(dto: ResendOtpDto): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Account is already verified');
    }

    await this.createAndSendOtp(user, OtpPurpose.SIGNUP);

    return { message: 'A new OTP has been sent to your email' };
  }

  // Checks the newest unused code for this purpose, then marks it used so
  // the same code cannot be replayed. Shared by both verify routes.
  private async consumeOtp(
    user: User,
    purpose: OtpPurpose,
    code: string,
  ): Promise<void> {
    const otp = await this.otpRepository.findOne({
      where: {
        user: { id: user.id },
        purpose,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });
    if (!otp) {
      throw new BadRequestException(
        'No pending verification code for this account',
      );
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    const isMatch = await bcrypt.compare(code, otp.codeHash);
    if (!isMatch) {
      throw new BadRequestException('Invalid verification code');
    }

    otp.isUsed = true;
    await this.otpRepository.save(otp);
  }

  // Confirms the signup code and flips the account to verified.
  async verifyOtp(dto: VerifyOtpDto): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.consumeOtp(user, OtpPurpose.SIGNUP, dto.code);

    user.isVerified = true;
    await this.userRepository.save(user);

    return { message: 'Account verified successfully' };
  }

  // Login step 1: password check, then email a LOGIN code. No token yet —
  // that only comes after the code is confirmed (two-factor login).
  async login(dto: LoginDto): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    // Same message for unknown email and wrong password — don't reveal
    // which accounts exist.
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Account is not verified');
    }

    await this.createAndSendOtp(user, OtpPurpose.LOGIN);

    return { message: 'OTP sent to your email' };
  }

  // Login step 2: confirms the LOGIN code and signs the JWT the guard reads.
  async verifyLoginOtp(dto: VerifyOtpDto): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.consumeOtp(user, OtpPurpose.LOGIN, dto.code);

    const accessToken = await this.jwtService.signAsync({
      userId: user.id,
      role: user.role,
    });

    return { accessToken };
  }

  // Finds the ngo row owned by this user id. Every guarded route starts here,
  // which is why identity always comes from the token and never the client.
  async getProfile(userId: number): Promise<Ngo> {
    const ngo = await this.ngoRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!ngo) {
      throw new NotFoundException('NGO profile not found');
    }

    return ngo;
  }

  // Full profile update. fullName is optional, so only overwrite it if sent.
  async updateProfile(userId: number, dto: UpdateNgoProfileDto): Promise<Ngo> {
    const ngo = await this.getProfile(userId);

    ngo.orgName = dto.orgName;
    ngo.regNumber = dto.regNumber;
    ngo.phone = dto.phone;
    ngo.city = dto.city;
    if (dto.fullName !== undefined) {
      ngo.fullName = dto.fullName;
    }

    return this.ngoRepository.save(ngo);
  }

  // Toggles the isActive flag on its own.
  async updateActiveStatus(
    userId: number,
    dto: UpdateActiveStatusDto,
  ): Promise<Ngo> {
    const ngo = await this.getProfile(userId);
    ngo.isActive = dto.isActive;

    return this.ngoRepository.save(ngo);
  }

  // Lists crises. Filters are optional, so only supplied ones are added to
  // the where clause — an empty where means "return everything".
  async browseCrises(dto: BrowseCrisisDto): Promise<Crisis[]> {
    // Only the filters actually supplied end up in the where clause.
    const where: FindOptionsWhere<Crisis> = {};
    if (dto.status) {
      where.status = dto.status;
    }
    if (dto.city) {
      where.city = dto.city;
    }
    if (dto.category) {
      where.category = dto.category;
    }

    return this.crisisRepository.find({ where });
  }

  // Loads the NGO together with the crises it has already joined — needed
  // by join/leave/my-crises so the M:N join table can be changed.
  private async getNgoWithCrises(userId: number): Promise<Ngo> {
    const ngo = await this.ngoRepository.findOne({
      where: { user: { id: userId } },
      relations: { crises: true },
    });
    if (!ngo) {
      throw new NotFoundException('NGO profile not found');
    }

    return ngo;
  }

  // The NGO plus the crises it has joined, loaded through the M:N relation.
  async getMyCrises(userId: number): Promise<Ngo> {
    return this.getNgoWithCrises(userId);
  }

  // M:N attach. Pushing onto ngo.crises and saving makes TypeORM insert the
  // crisis_participation row for us.
  async joinCrisis(userId: number, crisisId: number): Promise<object> {
    const ngo = await this.getNgoWithCrises(userId);
    const crisis = await this.findCrisisOrFail(crisisId);

    // Plain loop, not .some() — the course style rules rule out array helpers.
    for (const joined of ngo.crises) {
      if (joined.id === crisis.id) {
        throw new ConflictException('Already joined this crisis');
      }
    }

    ngo.crises.push(crisis);
    await this.ngoRepository.save(ngo);

    return { message: 'Joined crisis successfully' };
  }

  // M:N detach. Reassigning the array without that crisis and saving makes
  // TypeORM delete the matching crisis_participation row.
  async leaveCrisis(userId: number, crisisId: number): Promise<object> {
    const ngo = await this.getNgoWithCrises(userId);

    // Keep every crisis except the one being left.
    const remaining: Crisis[] = [];
    let wasJoined = false;
    for (const joined of ngo.crises) {
      if (joined.id === crisisId) {
        wasJoined = true;
      } else {
        remaining.push(joined);
      }
    }
    if (!wasJoined) {
      throw new NotFoundException('You have not joined this crisis');
    }

    ngo.crises = remaining;
    await this.ngoRepository.save(ngo);

    return { message: 'Left crisis successfully' };
  }

  // A call is always created under an existing crisis.
  private async findCrisisOrFail(crisisId: number): Promise<Crisis> {
    const crisis = await this.crisisRepository.findOne({
      where: { id: crisisId },
    });
    if (!crisis) {
      throw new NotFoundException('Crisis not found');
    }

    return crisis;
  }

  // 1:N create — the call belongs to this NGO and sits under one crisis.
  async createVolunteerCall(
    userId: number,
    dto: CreateVolunteerCallDto,
  ): Promise<VolunteerCall> {
    const ngo = await this.getProfile(userId);
    const crisis = await this.findCrisisOrFail(dto.crisisId);

    return this.volunteerCallRepository.save(
      this.volunteerCallRepository.create({
        title: dto.title,
        description: dto.description,
        slots: dto.slots,
        city: dto.city,
        ngo,
        crisis,
      }),
    );
  }

  // This NGO's own calls only, with the three optional filters applied.
  async browseVolunteerCalls(
    userId: number,
    dto: BrowseVolunteerCallDto,
  ): Promise<VolunteerCall[]> {
    const ngo = await this.getProfile(userId);

    // Own calls only — this is the NGO's management list.
    const where: FindOptionsWhere<VolunteerCall> = { ngo: { id: ngo.id } };
    if (dto.status) {
      where.status = dto.status;
    }
    if (dto.crisisId) {
      where.crisis = { id: Number(dto.crisisId) };
    }
    if (dto.city) {
      where.city = dto.city;
    }

    return this.volunteerCallRepository.find({ where });
  }

  // 404 if the id doesn't exist *or* belongs to another NGO — same answer
  // either way, so one NGO can't probe another's ids.
  private async findOwnVolunteerCall(
    userId: number,
    id: number,
  ): Promise<VolunteerCall> {
    const ngo = await this.getProfile(userId);
    const call = await this.volunteerCallRepository.findOne({
      where: { id, ngo: { id: ngo.id } },
    });
    if (!call) {
      throw new NotFoundException('Volunteer call not found');
    }

    return call;
  }

  // Full update of one own call. crisisId is not editable by design.
  async updateVolunteerCall(
    userId: number,
    id: number,
    dto: UpdateVolunteerCallDto,
  ): Promise<VolunteerCall> {
    const call = await this.findOwnVolunteerCall(userId, id);

    call.title = dto.title;
    call.description = dto.description;
    call.slots = dto.slots;
    call.city = dto.city;

    return this.volunteerCallRepository.save(call);
  }

  // Opens or closes a call so volunteers can/can't apply.
  async updateVolunteerCallStatus(
    userId: number,
    id: number,
    dto: UpdateVolunteerCallStatusDto,
  ): Promise<VolunteerCall> {
    const call = await this.findOwnVolunteerCall(userId, id);
    call.status = dto.status;

    return this.volunteerCallRepository.save(call);
  }

  // Deletes one own call.
  async deleteVolunteerCall(userId: number, id: number): Promise<object> {
    const call = await this.findOwnVolunteerCall(userId, id);
    await this.volunteerCallRepository.remove(call);

    return { message: 'Volunteer call deleted successfully' };
  }

  // 1:N create — a fundraising target under one crisis. raisedAmount starts
  // at 0 and is moved by the Donor role, never set here.
  async createDonationCall(
    userId: number,
    dto: CreateDonationCallDto,
  ): Promise<DonationCall> {
    const ngo = await this.getProfile(userId);
    const crisis = await this.findCrisisOrFail(dto.crisisId);

    return this.donationCallRepository.save(
      this.donationCallRepository.create({
        title: dto.title,
        description: dto.description,
        targetAmount: dto.targetAmount,
        ngo,
        crisis,
      }),
    );
  }

  // This NGO's own donation calls, filtered by status/crisisId.
  async browseDonationCalls(
    userId: number,
    dto: BrowseDonationCallDto,
  ): Promise<DonationCall[]> {
    const ngo = await this.getProfile(userId);

    const where: FindOptionsWhere<DonationCall> = { ngo: { id: ngo.id } };
    if (dto.status) {
      where.status = dto.status;
    }
    if (dto.crisisId) {
      where.crisis = { id: Number(dto.crisisId) };
    }

    return this.donationCallRepository.find({ where });
  }

  // Opens or closes a donation call.
  async updateDonationCallStatus(
    userId: number,
    id: number,
    dto: UpdateDonationCallStatusDto,
  ): Promise<DonationCall> {
    const ngo = await this.getProfile(userId);
    const call = await this.donationCallRepository.findOne({
      where: { id, ngo: { id: ngo.id } },
    });
    if (!call) {
      throw new NotFoundException('Donation call not found');
    }

    call.status = dto.status;

    return this.donationCallRepository.save(call);
  }

  // Who applied to one of our calls. Reads the Volunteer-owned application
  // table through a repository registered in our own module.
  async getApplicants(
    userId: number,
    volunteerCallId: number,
    dto: BrowseApplicantDto,
  ): Promise<Application[]> {
    // 404s if the call isn't yours, so you can only see your own applicants.
    await this.findOwnVolunteerCall(userId, volunteerCallId);

    const where: FindOptionsWhere<Application> = {
      volunteerCall: { id: volunteerCallId },
    };
    if (dto.status) {
      where.status = dto.status;
    }

    // volunteer + skills only — never the volunteer's user row, which
    // holds the password hash.
    return this.applicationRepository.find({
      where,
      relations: { volunteer: { skills: true } },
    });
  }

  // Loads an application and proves the call it belongs to is this NGO's.
  private async findOwnApplication(
    userId: number,
    applicationId: number,
  ): Promise<Application> {
    const ngo = await this.getProfile(userId);
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, volunteerCall: { ngo: { id: ngo.id } } },
      relations: { volunteer: { user: true }, volunteerCall: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  // 1:1 create — one approved application produces exactly one assignment,
  // flips the application to APPROVED, and emails the volunteer.
  async approveApplication(
    userId: number,
    applicationId: number,
  ): Promise<object> {
    const ngo = await this.getProfile(userId);
    const application = await this.findOwnApplication(userId, applicationId);

    // One assignment per application (1:1) — approving twice would break
    // that, so only a PENDING application can be decided.
    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictException('This application has already been decided');
    }

    const assignment = await this.assignmentRepository.save(
      this.assignmentRepository.create({
        application,
        ngo,
        // The role is the call they applied to; roleTitle is varchar(60)
        // while a call title is varchar(120), hence the trim.
        roleTitle: application.volunteerCall.title.substring(0, 60),
      }),
    );

    application.status = ApplicationStatus.APPROVED;
    await this.applicationRepository.save(application);

    await this.mailerService.sendMail({
      to: application.volunteer.user.email,
      subject: 'Your CrisisConnect application was approved',
      text: `Good news — ${ngo.orgName} approved your application for "${application.volunteerCall.title}".`,
    });

    // Built by hand: the saved entity still carries the nested volunteer →
    // user row, which must never go out in a response.
    return {
      message: 'Application approved',
      assignment: {
        id: assignment.id,
        roleTitle: assignment.roleTitle,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
      },
    };
  }

  // Turns down an application. No assignment row is created.
  async rejectApplication(
    userId: number,
    applicationId: number,
  ): Promise<object> {
    const application = await this.findOwnApplication(userId, applicationId);

    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictException('This application has already been decided');
    }

    application.status = ApplicationStatus.REJECTED;
    await this.applicationRepository.save(application);

    return { message: 'Application rejected' };
  }

  // This NGO's assignments, filtered by status and/or the call they came from.
  async browseAssignments(
    userId: number,
    dto: BrowseAssignmentDto,
  ): Promise<Assignment[]> {
    const ngo = await this.getProfile(userId);

    const where: FindOptionsWhere<Assignment> = { ngo: { id: ngo.id } };
    if (dto.status) {
      where.status = dto.status;
    }
    if (dto.volunteerCallId) {
      where.application = {
        volunteerCall: { id: Number(dto.volunteerCallId) },
      };
    }

    return this.assignmentRepository.find({ where });
  }

  // Marks the work finished.
  async completeAssignment(userId: number, id: number): Promise<Assignment> {
    const ngo = await this.getProfile(userId);
    const assignment = await this.assignmentRepository.findOne({
      where: { id, ngo: { id: ngo.id } },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    assignment.status = AssignmentStatus.COMPLETED;

    return this.assignmentRepository.save(assignment);
  }

  // Saves the uploaded file's path onto the ngo row. Multer has already
  // stored the file itself; we only keep the path so it can be served back.
  async uploadProfileImage(userId: number, filename: string): Promise<object> {
    // The interceptor leaves filename undefined if no file was attached.
    if (!filename) {
      throw new BadRequestException('Image file is required');
    }

    // Load the row, change the field, save it back — the same find/save
    // pair used everywhere else.
    const ngo = await this.getProfile(userId);
    ngo.profileImage = `/uploads/ngo/${filename}`;
    await this.ngoRepository.save(ngo);

    return {
      message: 'Profile image uploaded successfully',
      profileImage: ngo.profileImage,
    };
  }
}
