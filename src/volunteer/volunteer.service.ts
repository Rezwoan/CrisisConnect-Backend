import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';

import { OtpPurpose, UserRole } from '../common/common.enums';
import { Otp } from '../common/entities/otp.entity';
import { User } from '../common/entities/user.entity';
import { Application } from './entities/application.entity';
import { Skill } from './entities/skill.entity';
import { Volunteer } from './entities/volunteer.entity';
import { WorkLog } from './entities/work-log.entity';
import { ApplicationStatus } from './volunteer.enums';
import {
  ApplyTaskDto,
  CreateVolunteerDto,
  LoginDto,
  UpdateVolunteerDto,
  VerifyOtpDto,
  WorkLogDto,
} from './volunteer.dto';
import { VolunteerCall } from '../ngo/entities/volunteer-call.entity';
import { Assignment } from '../ngo/entities/assignment.entity';

@Injectable()
export class VolunteerService {
  private static readonly GMAIL_REGEX = /^[A-Za-z0-9._%+-]+@gmail\.com$/;

  constructor(
    @InjectRepository(Volunteer)
    private readonly volunteerRepo: Repository<Volunteer>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(WorkLog)
    private readonly workLogRepo: Repository<WorkLog>,
    @InjectRepository(VolunteerCall)
    private readonly volunteerCallRepo: Repository<VolunteerCall>,
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
    @Inject(MailerService)
    private readonly mailerService: MailerService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getStatus(): string {
    return 'Volunteer module is working';
  }

  private async findVolunteerByIdentity(identifier: number, relations?: any) {
    return this.volunteerRepo.findOne({
      where: [{ id: identifier }, { user: { id: identifier } }],
      relations,
    });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async findVolunteerByEmail(email: string, relations?: any) {
    return this.volunteerRepo.findOne({
      where: { email },
      relations,
    });
  }

  private async sendOtpEmail(email: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'CrisisConnect OTP',
        text: `Your OTP is ${otp}`,
      });
    } catch {
      // Intentionally swallow mailer errors so the flow still works locally.
    }
  }

  private async saveOtp(user: User, purpose: OtpPurpose, code: string) {
    const codeHash = await bcrypt.hash(code, 10);
    const otp = this.otpRepo.create({
      user,
      codeHash,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isUsed: false,
    });
    return this.otpRepo.save(otp);
  }

  async signup(dto: CreateVolunteerDto) {
    if (!VolunteerService.GMAIL_REGEX.test(dto.email)) {
      throw new BadRequestException('Please enter a valid Gmail address');
    }

    const existingVolunteer = await this.findVolunteerByEmail(dto.email);
    if (existingVolunteer) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.volunteerRepo.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userRepo = this.dataSource.getRepository(User);
    const user = userRepo.create({
      email: dto.email,
      passwordHash,
      role: UserRole.VOLUNTEER,
      isVerified: true,
    });
    const savedUser = await userRepo.save(user);

    const volunteer = this.volunteerRepo.create({
      user: savedUser,
      email: dto.email,
      password: passwordHash,
      username: dto.username,
      fullName: dto.fullName,
      phone: dto.phone,
      city: dto.city,
    });
    const savedVolunteer = await this.volunteerRepo.save(volunteer);

    const token = jwt.sign(
      {
        userId: savedUser.id,
        role: savedUser.role,
        volunteerId: savedVolunteer.id,
      },
      process.env.JWT_SECRET ?? 'dev-secret',
      { expiresIn: '1d' },
    );

    return {
      message: 'Signup successful',
      token,
      volunteerId: savedVolunteer.id,
      email: dto.email,
      username: savedVolunteer.username,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const volunteer = await this.findVolunteerByEmail(dto.email, {
      user: true,
    });
    if (!volunteer?.user) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const otp = await this.otpRepo.findOne({
      where: {
        user: { id: volunteer.user.id },
        purpose: OtpPurpose.SIGNUP,
        isUsed: false,
      },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const isValidOtp = await bcrypt.compare(dto.code, otp.codeHash);
    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    otp.isUsed = true;
    volunteer.user.isVerified = true;
    await this.otpRepo.save(otp);
    await this.dataSource.getRepository(User).save(volunteer.user);

    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    const volunteer = await this.findVolunteerByEmail(dto.email, {
      user: true,
    });
    if (!volunteer?.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      volunteer.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign(
      {
        userId: volunteer.user.id,
        role: volunteer.user.role,
        volunteerId: volunteer.id,
      },
      process.env.JWT_SECRET ?? 'dev-secret',
      { expiresIn: '1d' },
    );

    return {
      message: 'Login successful',
      token,
      volunteerId: volunteer.id,
      email: volunteer.email,
    };
  }

  async verifyLoginOtp(dto: VerifyOtpDto) {
    const volunteer = await this.findVolunteerByEmail(dto.email, {
      user: true,
    });
    if (!volunteer?.user) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const otp = await this.otpRepo.findOne({
      where: {
        user: { id: volunteer.user.id },
        purpose: OtpPurpose.LOGIN,
        isUsed: false,
      },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const isValidOtp = await bcrypt.compare(dto.code, otp.codeHash);
    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    otp.isUsed = true;
    await this.otpRepo.save(otp);

    const token = jwt.sign(
      {
        userId: volunteer.user.id,
        role: volunteer.user.role,
        volunteerId: volunteer.id,
      },
      process.env.JWT_SECRET ?? 'dev-secret',
      { expiresIn: '1d' },
    );

    return {
      message: 'Login successful',
      token,
      role: volunteer.user.role,
      volunteerId: volunteer.id,
    };
  }

  async uploadProfileImage(userId: number, filename: string) {
    if (!filename) {
      throw new BadRequestException('Image file is required');
    }

    const volunteer = await this.findVolunteerByIdentity(userId);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    const profileImage = `/uploads/volunteer/${filename}`;
    await this.volunteerRepo
      .createQueryBuilder()
      .update(Volunteer)
      .set({ profileImage })
      .where('id = :volunteerId', { volunteerId: volunteer.id })
      .execute();

    return {
      message: 'Profile image uploaded successfully',
      profileImage,
    };
  }

  async getProfile(volunteerId: number) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId, {
      skills: true,
      user: true,
    });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
    return volunteer;
  }

  async updateProfile(volunteerId: number, dto: UpdateVolunteerDto) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    Object.assign(volunteer, {
      fullName: dto.fullName ?? volunteer.fullName,
      phone: dto.phone ?? volunteer.phone,
      city: dto.city ?? volunteer.city,
    });

    return this.volunteerRepo.save(volunteer);
  }

  async updateAvailability(volunteerId: number, isAvailable: boolean) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
    volunteer.isAvailable = isAvailable;
    await this.volunteerRepo.save(volunteer);
    return { message: 'Availability updated', isAvailable };
  }
  async deleteVolunteer(volunteerId: number) {
    const volunteer = await this.volunteerRepo.findOne({
      where: { id: volunteerId },
      relations: { user: true },
    });

    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    await this.dataSource.transaction(async (manager) => {
      const volunteerRepo = manager.getRepository(Volunteer);
      const userRepo = manager.getRepository(User);
      const otpRepo = manager.getRepository(Otp);

      if (volunteer.user) {
        await otpRepo.delete({ user: { id: volunteer.user.id } });
      }

      await volunteerRepo.remove(volunteer);

      if (volunteer.user) {
        await userRepo.remove(volunteer.user);
      }
    });

    return { message: 'Volunteer deleted successfully', id: volunteerId };
  }

  async searchVolunteer(city?: string, isAvailable?: boolean, skill?: string) {
    const qb = this.volunteerRepo
      .createQueryBuilder('volunteer')
      .leftJoinAndSelect('volunteer.skills', 'skill');

    if (city) {
      qb.andWhere('LOWER(volunteer.city) LIKE LOWER(:city)', {
        city: `%${city}%`,
      });
    }
    if (isAvailable !== undefined) {
      qb.andWhere('volunteer.isAvailable = :isAvailable', { isAvailable });
    }
    if (skill) {
      qb.andWhere('LOWER(skill.name) LIKE LOWER(:skill)', {
        skill: `%${skill}%`,
      });
    }

    const volunteers = await qb.getMany();
    return { city, isAvailable, skill, volunteers };
  }

  async getVolunteerByUsername(username: string) {
    const volunteer = await this.volunteerRepo.findOne({
      where: { username },
      relations: { skills: true, user: true },
    });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
    return volunteer;
  }

  async createSkill(name: string) {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new BadRequestException('Skill name is required');
    }

    const existing = await this.skillRepo
      .createQueryBuilder('skill')
      .where('LOWER(skill.name) = LOWER(:name)', { name: normalizedName })
      .getOne();
    if (existing) {
      throw new ConflictException('Skill already exists');
    }

    const skill = this.skillRepo.create({ name: normalizedName });
    return this.skillRepo.save(skill);
  }

  async addSkill(volunteerId: number, skillId: number) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId, {
      skills: true,
    });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
    const skill = await this.skillRepo.findOne({ where: { id: skillId } });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const alreadyHasSkill = volunteer.skills.some((s) => s.id === skillId);
    if (!alreadyHasSkill) {
      volunteer.skills.push(skill);
      await this.volunteerRepo.save(volunteer);
    }

    return { message: 'Skill added', skillId };
  }

  async removeSkill(volunteerId: number, skillId: number) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId, {
      skills: true,
    });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    volunteer.skills = volunteer.skills.filter((s) => s.id !== skillId);
    await this.volunteerRepo.save(volunteer);

    return { message: 'Skill removed', skillId };
  }

  async getMySkills(volunteerId: number) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId, {
      skills: true,
    });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
    return volunteer.skills;
  }

  async getVolunteerCalls(city?: string, crisisId?: number, status?: string) {
    const qb = this.volunteerCallRepo.createQueryBuilder('call');

    if (city) {
      qb.andWhere('LOWER(call.city) LIKE LOWER(:city)', { city: `%${city}%` });
    }
    if (crisisId !== undefined) {
      qb.andWhere('call.crisisId = :crisisId', { crisisId });
    }
    if (status) {
      qb.andWhere('call.status = :status', { status });
    }

    const calls = await qb.getMany();
    return { city, crisisId, status, calls };
  }

  async apply(volunteerId: number, dto: ApplyTaskDto) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    const volunteerCall = await this.volunteerCallRepo.findOne({
      where: { id: dto.volunteerCallId },
    });
    if (!volunteerCall) {
      throw new NotFoundException('Volunteer call not found');
    }

    const existing = await this.applicationRepo.findOne({
      where: {
        volunteer: { id: volunteer.id },
        volunteerCall: { id: dto.volunteerCallId },
      },
    });
    if (existing) {
      throw new ConflictException('Already applied to this call');
    }

    const application = this.applicationRepo.create({
      volunteer,
      volunteerCall,
      message: dto.message,
      status: ApplicationStatus.PENDING,
    });

    return this.applicationRepo.save(application);
  }

  async getApplications(volunteerId: number, status?: ApplicationStatus) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    const where: any = { volunteer: { id: volunteer.id } };
    if (status) {
      where.status = status;
    }

    return this.applicationRepo.find({
      where,
      relations: { volunteerCall: true },
    });
  }

  async deleteApplication(volunteerId: number, applicationId: number) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    const application = await this.applicationRepo.findOne({
      where: { id: applicationId, volunteer: { id: volunteer.id } },
      relations: { volunteer: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be deleted');
    }

    await this.applicationRepo.remove(application);
    return { message: 'Application deleted', id: applicationId };
  }

  async getAssignments(volunteerId: number) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    const assignments = await this.assignmentRepo.find({
      where: { application: { volunteer: { id: volunteer.id } } },
      relations: { application: { volunteer: true } },
    });
    return assignments;
  }

  async createWorkLog(volunteerId: number, dto: WorkLogDto) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    const assignment = await this.assignmentRepo.findOne({
      where: { id: dto.assignmentId },
      relations: { application: { volunteer: true } },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.application?.volunteer?.id !== volunteer.id) {
      throw new UnauthorizedException(
        'Assignment does not belong to this volunteer',
      );
    }

    const workLog = await this.dataSource.transaction(async (manager) => {
      const workLogRepo = manager.getRepository(WorkLog);
      const volunteerRepo = manager.getRepository(Volunteer);

      const created = workLogRepo.create({
        assignment,
        hours: dto.hours,
        note: dto.note,
      });
      const saved = await workLogRepo.save(created);

      await volunteerRepo
        .createQueryBuilder()
        .update(Volunteer)
        .set({ totalHours: () => '"totalHours" + :hours' })
        .where('id = :volunteerId', {
          volunteerId: volunteer.id,
          hours: dto.hours,
        })
        .execute();

      return saved;
    });

    return workLog;
  }

  async getWorkLogs(
    volunteerId: number,
    assignmentId?: number,
    from?: string,
    to?: string,
  ) {
    const volunteer = await this.findVolunteerByIdentity(volunteerId);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    const qb = this.workLogRepo
      .createQueryBuilder('workLog')
      .leftJoinAndSelect('workLog.assignment', 'assignment')
      .leftJoinAndSelect('assignment.application', 'application')
      .leftJoin('application.volunteer', 'volunteer')
      .where('volunteer.id = :volunteerId', { volunteerId: volunteer.id });

    if (assignmentId !== undefined) {
      qb.andWhere('assignment.id = :assignmentId', { assignmentId });
    }
    if (from) {
      qb.andWhere('workLog.loggedAt >= :from', { from });
    }
    if (to) {
      qb.andWhere('workLog.loggedAt <= :to', { to });
    }

    return qb.getMany();
  }
}
