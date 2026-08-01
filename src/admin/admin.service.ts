import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Like, Repository } from 'typeorm';

import { OtpPurpose, UserRole } from '../common/common.enums';
import { Otp } from '../common/entities/otp.entity';
import { User } from '../common/entities/user.entity';
import { AdminStatus, CrisisStatus } from './admin.enums';
import { Admin } from './entities/admin.entity';
import { Announcement } from './entities/announcement.entity';
import { Crisis } from './entities/crisis.entity';

import { CreateAdminDto } from './dto/admin.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { CreateCrisisDto } from './dto/create-crisis.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateCrisisStatusDto } from './dto/update-crisis-status.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAdminStatusDto } from './dto/update-status.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Crisis)
    private readonly crisisRepository: Repository<Crisis>,
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  getStatus(): string {
    return 'Admin module is working';
  }

  async uploadProfileImage(userId: number, filename?: string): Promise<object> {
    if (!filename) {
      throw new BadRequestException('Image file is required');
    }

    const profileImage = `/uploads/admin/${filename}`;
    await this.adminRepository
      .createQueryBuilder()
      .update(Admin)
      .set({ profileImage })
      .where('userId = :userId', { userId })
      .execute();

    return {
      message: 'Profile image uploaded successfully',
      profileImage,
    };
  }

  async signup(dto: CreateAdminDto): Promise<object> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email } as any,
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      isVerified: false,
      isActive: true,
    } as any) as unknown as User;
    const savedUser = await this.userRepository.save(user);

    const admin = this.adminRepository.create({
      user: savedUser,
      fullName: dto.fullName,
      phone: dto.phone,
      city: dto.city,
      age: dto.age,
      status: AdminStatus.ACTIVE,
    });
    await this.adminRepository.save(admin);

    await this.sendOtp(savedUser, OtpPurpose.SIGNUP);

    return { message: 'Signup successful, OTP sent to your email' };
  }

  async login(dto: LoginDto): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email } as any,
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      (user as any).passwordHash,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    if (!(user as any).isVerified) {
      throw new UnauthorizedException(
        'Please verify your account before logging in',
      );
    }

    await this.sendOtp(user, OtpPurpose.LOGIN);
    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email } as any,
    });
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.otpRepository.findOne({
      where: {
        user: { id: user.id },
        purpose: OtpPurpose.SIGNUP,
        isUsed: false,
      } as any,
      order: { createdAt: 'DESC' } as any,
    });

    if (!otp || (otp as any).expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isMatch = await bcrypt.compare(dto.code, (otp as any).codeHash);
    if (!isMatch) throw new BadRequestException('Invalid OTP code');

    (otp as any).isUsed = true;
    await this.otpRepository.save(otp);

    (user as any).isVerified = true;
    await this.userRepository.save(user);

    return { message: 'Account verified successfully' };
  }

  async verifyLoginOtp(dto: VerifyOtpDto): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email } as any,
    });
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.otpRepository.findOne({
      where: {
        user: { id: user.id },
        purpose: OtpPurpose.LOGIN,
        isUsed: false,
      } as any,
      order: { createdAt: 'DESC' } as any,
    });

    if (!otp || (otp as any).expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isMatch = await bcrypt.compare(dto.code, (otp as any).codeHash);
    if (!isMatch) throw new BadRequestException('Invalid OTP code');

    (otp as any).isUsed = true;
    await this.otpRepository.save(otp);

    const token = this.jwtService.sign({
      userId: user.id,
      role: (user as any).role,
    });
    return { accessToken: token };
  }

  private async sendOtp(user: User, purpose: OtpPurpose): Promise<void> {
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(rawCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otp = this.otpRepository.create({
      codeHash: hashedCode,
      purpose,
      expiresAt,
      isUsed: false,
      user,
    } as any);
    await this.otpRepository.save(otp);

    try {
      await this.mailerService.sendMail({
        to: (user as any).email,
        subject: `CrisisConnect - Your ${purpose} OTP`,
        text: `Your OTP code is: ${rawCode}. It expires in 10 minutes.`,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  async getProfile(userId: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true }, // FIX: TypeORM 0.3.x object syntax
    });
    if (!admin) throw new NotFoundException('Admin profile not found');
    return admin;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Admin> {
    const admin = await this.getProfile(userId);
    Object.assign(admin, dto);
    return this.adminRepository.save(admin);
  }

  async updateProfileStatus(
    userId: number,
    dto: UpdateAdminStatusDto,
  ): Promise<Admin> {
    const admin = await this.getProfile(userId);
    admin.status = dto.status;
    return this.adminRepository.save(admin);
  }

  async getUsers(filters: {
    role?: UserRole;
    isActive?: boolean;
    city?: string;
    search?: string;
  }): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.admin', 'admin');

    if (filters.role)
      query.andWhere('user.role = :role', { role: filters.role });
    if (filters.isActive !== undefined)
      query.andWhere('user.isActive = :isActive', {
        isActive: filters.isActive,
      });
    if (filters.city)
      query.andWhere('admin.city = :city', { city: filters.city });
    if (filters.search) {
      query.andWhere(
        '(user.email LIKE :search OR admin.fullName LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return query.getMany();
  }

  async deactivateUser(id: number): Promise<object> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    (user as any).isActive = false;
    await this.userRepository.save(user);

    return { message: 'User deactivated', id, isActive: false };
  }

  async createCrisis(userId: number, dto: CreateCrisisDto): Promise<Crisis> {
    const admin = await this.getProfile(userId);
    const crisis = this.crisisRepository.create({
      ...dto,
      status: CrisisStatus.ACTIVE,
      declaredByAdmin: admin,
    });
    return this.crisisRepository.save(crisis);
  }

  async getCrises(filters: {
    status?: CrisisStatus;
    severity?: string;
    category?: string;
    city?: string;
  }): Promise<Crisis[]> {
    const query = this.crisisRepository.createQueryBuilder('crisis');

    if (filters.status)
      query.andWhere('crisis.status = :status', { status: filters.status });
    if (filters.severity)
      query.andWhere('crisis.severity = :severity', {
        severity: filters.severity,
      });
    if (filters.category)
      query.andWhere('crisis.category = :category', {
        category: filters.category,
      });
    if (filters.city)
      query.andWhere('crisis.city = :city', { city: filters.city });

    return query.getMany();
  }

  async getCrisisById(id: number): Promise<Crisis> {
    const crisis = await this.crisisRepository.findOne({
      where: { id },
      relations: { declaredByAdmin: true, ngos: true }, // FIX: TypeORM 0.3.x object syntax
    });
    if (!crisis) throw new NotFoundException(`Crisis with ID ${id} not found`);
    return crisis;
  }

  async updateCrisis(
    id: number,
    dto: Partial<CreateCrisisDto>,
  ): Promise<Crisis> {
    const crisis = await this.getCrisisById(id);
    Object.assign(crisis, dto);
    return this.crisisRepository.save(crisis);
  }

  async updateCrisisStatus(
    id: number,
    dto: UpdateCrisisStatusDto,
  ): Promise<Crisis> {
    const crisis = await this.getCrisisById(id);
    crisis.status = dto.status;
    return this.crisisRepository.save(crisis);
  }

  async deleteCrisis(id: number): Promise<object> {
    const crisis = await this.getCrisisById(id);
    await this.crisisRepository.remove(crisis);
    return { message: `Crisis with ID ${id} deleted successfully` };
  }

  async createAnnouncement(
    userId: number,
    dto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    const admin = await this.getProfile(userId);

    const recipients = await this.userRepository.findBy({
      id: In(dto.recipientUserIds),
    });

    if (recipients.length === 0) {
      throw new BadRequestException(
        'At least one valid recipient user is required',
      );
    }

    const announcement = this.announcementRepository.create({
      title: dto.title,
      body: dto.body,
      isUrgent: dto.isUrgent ?? false,
      admin,
      recipients,
    });

    const savedAnnouncement =
      await this.announcementRepository.save(announcement);

    if (savedAnnouncement.isUrgent) {
      for (const recipient of recipients) {
        await this.mailerService.sendMail({
          to: (recipient as any).email,
          subject: `URGENT ANNOUNCEMENT: ${dto.title}`,
          text: dto.body,
        });
      }
    }

    return savedAnnouncement;
  }

  async getAnnouncementById(id: number): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
      relations: { recipients: true },
    });
    if (!announcement)
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    return announcement;
  }

  async removeAnnouncementRecipient(
    id: number,
    recipientUserId: number,
  ): Promise<object> {
    const announcement = await this.getAnnouncementById(id);
    const initialCount = announcement.recipients.length;

    announcement.recipients = announcement.recipients.filter(
      (user) => user.id !== Number(recipientUserId),
    );

    if (announcement.recipients.length === initialCount) {
      throw new NotFoundException(
        `Recipient with User ID ${recipientUserId} not found on this announcement`,
      );
    }

    await this.announcementRepository.save(announcement);
    return { message: 'Recipient removed' };
  }
}
