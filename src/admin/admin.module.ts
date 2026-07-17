import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { Crisis } from './entities/crisis.entity';
import { Announcement } from './entities/announcement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Crisis, Announcement])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
