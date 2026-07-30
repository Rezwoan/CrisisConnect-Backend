import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { NgoController } from './ngo.controller';
import { NgoService } from './ngo.service';
import { NgoGuard } from './ngo.guard';
import { Ngo } from './entities/ngo.entity';
import { VolunteerCall } from './entities/volunteer-call.entity';
import { DonationCall } from './entities/donation-call.entity';
import { Assignment } from './entities/assignment.entity';
import { User } from '../common/entities/user.entity';
import { Otp } from '../common/entities/otp.entity';

// User and Otp are the shared auth-core tables (owned by the repo owner),
// registered here so they materialise in Postgres alongside everyone else's.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ngo,
      VolunteerCall,
      DonationCall,
      Assignment,
      User,
      Otp,
    ]),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: config.get<string>('MAIL_USER'),
        },
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [NgoController],
  providers: [NgoService, NgoGuard],
})
export class NgoModule {}
