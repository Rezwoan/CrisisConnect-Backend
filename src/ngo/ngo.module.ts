import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NgoController } from './ngo.controller';
import { NgoService } from './ngo.service';
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
    TypeOrmModule.forFeature([Ngo, VolunteerCall, DonationCall, Assignment, User, Otp]),
  ],
  controllers: [NgoController],
  providers: [NgoService],
})
export class NgoModule {}
