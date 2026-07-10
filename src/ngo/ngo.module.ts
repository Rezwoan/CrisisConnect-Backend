import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NgoController } from './ngo.controller';
import { NgoService } from './ngo.service';
import { Ngo } from './ngo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ngo])],
  controllers: [NgoController],
  providers: [NgoService],
})
export class NgoModule {}
