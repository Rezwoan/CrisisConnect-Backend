import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../common/config/multer.config';
import { NgoService } from './ngo.service';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { LoginDto } from './dto/login.dto';
import { NgoGuard, JwtPayload } from './ngo.guard';

// Base HTTP entry point for the NGO role (User Category 2).
// File uploads for this role go into its own uploads/ngo folder —
// implement the upload/download endpoints here when needed.
@Controller('ngo')
export class NgoController {
  constructor(private readonly ngoService: NgoService) {}

  @Post('signup')
  signup(@Body() dto: CreateNgoDto) {
    return this.ngoService.signup(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.ngoService.verifyOtp(dto);
  }

  @Post('resend-otp')
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.ngoService.resendOtp(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.ngoService.login(dto);
  }

  @Post('verify-login-otp')
  verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.ngoService.verifyLoginOtp(dto);
  }

  @Post('profile/image')
  @UseGuards(NgoGuard)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions('ngo')))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: JwtPayload },
  ) {
    return this.ngoService.uploadProfileImage(req.user.userId, file?.filename);
  }
}
