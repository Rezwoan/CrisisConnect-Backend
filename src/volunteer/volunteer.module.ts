import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerController } from './volunteer.controller';
import { VolunteerService } from './volunteer.service';
import { Volunteer } from './entities/volunteer.entity';
import { Skill } from './entities/skill.entity';
import { Application } from './entities/application.entity';
import { WorkLog } from './entities/work-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Volunteer, Skill, Application, WorkLog])],
  controllers: [VolunteerController],
  providers: [VolunteerService],
})
export class VolunteerModule {}
