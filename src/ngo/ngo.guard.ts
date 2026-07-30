import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../common/common.enums';

// What verify-login-otp signs into the token, plus the two claims the
// JWT library adds itself (issued-at and expiry).
export interface JwtPayload {
  userId: number;
  role: UserRole;
  iat: number;
  exp: number;
}

// Shape of the request fields this guard touches. `user` is what the guard
// attaches so controllers know who is calling.
interface GuardedRequest {
  headers: { authorization?: string };
  user?: JwtPayload;
}

@Injectable()
export class NgoGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GuardedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    // Everything after 'Bearer '
    const token = authHeader.substring(7);

    let payload: JwtPayload;
    try {
      // Fails if the token was tampered with, signed with a different
      // secret, or has already expired.
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.role !== UserRole.NGO) {
      throw new ForbiddenException('This route is for NGO accounts only');
    }

    // Hand the identity to the controller/service.
    request.user = payload;
    return true;
  }
}
