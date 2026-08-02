import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../common/common.enums';

// The data we put inside the token when signing it in verify-login-otp,
// plus iat (issued at) and exp (expires at) which the JWT library adds.
// Declaring it as an interface just lets us write payload.role safely.
export interface JwtPayload {
  userId: number;
  role: UserRole;
  iat: number;
  exp: number;
}

// The two request fields this guard touches. We only describe these two so
// TypeScript knows what request.headers and request.user are.
interface GuardedRequest {
  headers: { authorization?: string };
  user?: JwtPayload;
}

// A Guard runs BEFORE the route handler and decides if the request may
// continue: return true to allow it, throw to block it. Same CanActivate
// pattern as the SessionGuard from Lecture 5.0, except we check a JWT
// instead of a session.
// It answers two things — is this a real token we signed (else 401), and is
// the user an NGO (else 403) — then puts the identity on request.user so
// the routes know who is calling without trusting the client.
@Injectable()
export class NgoGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Gets the incoming HTTP request object out of the Nest context.
    const request = context.switchToHttp().getRequest<GuardedRequest>();
    const authHeader = request.headers.authorization;

    // The header must look like "Bearer <token>".
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    // Split "Bearer <token>" on the space and keep the second half.
    const token = authHeader.split(' ')[1];

    let payload: JwtPayload;
    try {
      // verifyAsync re-checks the signature with JWT_SECRET and the expiry
      // date. It throws if the token was edited, signed with another
      // secret, or has expired — so a fake token can never get past here.
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // A real token, but belonging to a Volunteer/Donor/Admin: 403 not 401.
    if (payload.role !== UserRole.NGO) {
      throw new ForbiddenException('This route is for NGO accounts only');
    }

    // Hand the identity to the controller, which passes it to the service.
    request.user = payload;
    return true;
  }
}
