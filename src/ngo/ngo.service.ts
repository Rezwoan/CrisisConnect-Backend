import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Ngo } from './entities/ngo.entity';
import { User } from '../common/entities/user.entity';
import { Otp } from '../common/entities/otp.entity';
import { UserRole, OtpPurpose } from '../common/common.enums';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { LoginDto } from './dto/login.dto';

const OTP_EXPIRY_MINUTES = 10;

// Business logic for the NGO role (User Category 2). Replace this
// stub with real DB-backed logic as routes are added back.
@Injectable()
export class NgoService {
  constructor(
    @InjectRepository(Ngo)
    private readonly ngoRepository: Repository<Ngo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: CreateNgoDto): Promise<{ message: string }> {
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

  async resendOtp(dto: ResendOtpDto): Promise<{ message: string }> {
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

  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
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

  async login(dto: LoginDto): Promise<{ message: string }> {
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

  async verifyLoginOtp(dto: VerifyOtpDto): Promise<{ accessToken: string }> {
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

  async uploadProfileImage(userId: number, filename: string): Promise<object> {
    if (!filename) {
      throw new BadRequestException('Image file is required');
    }

    const profileImage = `/uploads/ngo/${filename}`;
    await this.ngoRepository
      .createQueryBuilder()
      .update(Ngo)
      .set({ profileImage })
      .where('userId = :userId', { userId })
      .execute();

    return {
      message: 'Profile image uploaded successfully',
      profileImage,
    };
  }
}
