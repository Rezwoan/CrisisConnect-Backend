import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { Admin } from './entities/admin.entity';
import { Crisis } from './entities/crisis.entity';
import { Announcement } from './entities/announcement.entity';
import { User } from '../common/entities/user.entity';
import { Otp } from '../common/entities/otp.entity';

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
