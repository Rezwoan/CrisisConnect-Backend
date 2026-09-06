import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
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
import { Crisis } from '../admin/entities/crisis.entity';
import { Application } from '../volunteer/entities/application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ngo,
      VolunteerCall,
      DonationCall,
      Assignment,
      User,
      Otp,
      Crisis,
      Application,
    ]),
    // The signing secret and lifetime for our JWTs. The same secret signs
    // tokens in the service and verifies them in the guard.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [NgoController],
  // NgoGuard is a provider so Nest can inject JwtService into it.
  providers: [NgoService, NgoGuard],
})
export class NgoModule {}
