import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../volunteer.dto';
import { CreateVolunteerDto } from '../volunteer.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
export class PublicAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe())
  signup(@Body() dto: CreateVolunteerDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Body() body: any) {
    return { message: 'Authenticated', body };
  }
}


