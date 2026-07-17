import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonorController } from './donor.controller';
import { DonorService } from './donor.service';
import { Donor } from './entities/donor.entity';
import { Donation } from './entities/donation.entity';
import { Payment } from './entities/payment.entity';
import { Receipt } from './entities/receipt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donor, Donation, Payment, Receipt])],
  controllers: [DonorController],
  providers: [DonorService],
})
export class DonorModule {}
