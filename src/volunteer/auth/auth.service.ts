import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { UserRole } from '../../common/common.enums';
import { LoginDto } from '../volunteer.dto';
import { CreateVolunteerDto } from '../volunteer.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async signup(dto: CreateVolunteerDto) {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      role: UserRole.VOLUNTEER,
      isVerified: true,
    });

    const savedUser = await this.userRepo.save(user);
    try {
      await this.mailerService.sendMail({
        from: process.env.MAIL_USER,
        to: savedUser.email,
        subject: 'Welcome to CrisisConnect',
        text: `Hello ${dto.fullName || dto.username},\n\nYour account has been created successfully.\n\nYou can now log in and use your token for protected requests.`,
      });
    } catch {
      // continue even if email fails
    }

    const token = await this.jwtService.signAsync({
      sub: savedUser.id,
      userId: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    return {
      message: 'Signup successful',
      token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordCorrect = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid email or password');
    }

    try {
      await this.mailerService.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: 'CrisisConnect login alert',
        text: `Hello,\n\nYou logged in to CrisisConnect successfully.`,
      });
    } catch {
      // continue even if email fails
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}


