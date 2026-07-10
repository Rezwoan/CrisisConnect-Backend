import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { NgoModule } from './ngo/ngo.module';
import { VolunteerModule } from './volunteer/volunteer.module';
import { DonorModule } from './donor/donor.module';
import { TypeOrmModule } from "@nestjs/typeorm";


@Module({
  imports: [AdminModule, NgoModule, VolunteerModule, DonorModule,TypeOrmModule.forRoot(
{ type: 'postgres',
host: 'localhost',
port: 5432,
username: 'postgres',
password: '1234abcd',
database: 'users',//Change to your database name
autoLoadEntities: true,
synchronize: true,
} ),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
