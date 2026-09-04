import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

// Shared, role-agnostic entry point for the unified login/registration
// flow. This is the only route every role's frontend calls before it knows
// which role's own signup/login endpoints to use next.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('role')
  findRole(@Query('email') email?: string) {
    return this.authService.findRole(email);
  }
}
