import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../common/entities/user.entity';
import { AuthController } from './auth.controller';
import { PublicAuthController } from './public-auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
        port: Number(process.env.MAIL_PORT ?? 587),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, PublicAuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}


