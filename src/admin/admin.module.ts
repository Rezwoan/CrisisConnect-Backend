import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from '../common/entities/otp.entity';
import { User } from '../common/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { Announcement } from './entities/announcement.entity';
import { Crisis } from './entities/crisis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Crisis, Announcement, User, Otp]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'steve900032@gmail.com',
          pass: 'wfprzsxaafeqozsr',
        },
      },
      defaults: {
        from: '"CrisisConnect" <noreply@crisisconnect.com>',
      },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
  exports: [AdminGuard, JwtModule],
})
export class AdminModule {}
