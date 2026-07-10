import { Module } from '@nestjs/common';
import { DonorController } from './donor.controller';
import { DonorService } from './donor.service';
import { Donor } from './donor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Donor])],
  controllers: [DonorController],
  providers: [DonorService],
})
export class DonorModule {}
