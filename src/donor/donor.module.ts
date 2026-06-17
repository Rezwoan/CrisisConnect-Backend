import { Module } from '@nestjs/common';
import { DonorController } from './donor.controller';
import { DonorService } from './donor.service';

@Module({
  controllers: [DonorController],
  providers: [DonorService]
})
export class DonorModule {}
