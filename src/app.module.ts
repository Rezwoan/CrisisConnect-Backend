import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { NgoModule } from './ngo/ngo.module';
import { VolunteerModule } from './volunteer/volunteer.module';
import { DonorModule } from './donor/donor.module';

@Module({
  imports: [AdminModule, NgoModule, VolunteerModule, DonorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
