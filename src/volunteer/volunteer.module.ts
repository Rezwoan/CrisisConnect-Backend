
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VolunteerController } from './volunteer.controller';
import { VolunteerService } from './volunteer.service';

import { Volunteer } from './entities/volunteer.entity';
import { Skill } from './entities/skill.entity';
import { Application } from './entities/application.entity';
import { WorkLog } from './entities/work-log.entity';
import { VolunteerCall } from '../ngo/entities/volunteer-call.entity';
import { Assignment } from '../ngo/entities/assignment.entity';
import { User } from '../common/entities/user.entity';
import { Otp } from '../common/entities/otp.entity';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Volunteer, Skill, Application, WorkLog, VolunteerCall, Assignment, User, Otp]),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
        port: Number(process.env.MAIL_PORT ?? 587),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],

  
  controllers: [VolunteerController],
  providers: [VolunteerService, JwtAuthGuard],
  exports: [VolunteerService,JwtAuthGuard,JwtModule],
})

export class VolunteerModule {}



