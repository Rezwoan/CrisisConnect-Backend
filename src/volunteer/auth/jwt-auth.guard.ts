import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET ?? 'dev-secret',
      });

      const role = payload.role ?? payload.userRole;
      const volunteerId = payload.volunteerId ?? payload.userId ?? payload.id ?? payload.sub;

      if (role !== 'VOLUNTEER') {
        throw new ForbiddenException('Only volunteer accounts can access this route');
      }

      if (!volunteerId) {
        throw new UnauthorizedException('Missing or invalid token');
      }

      req.user = {
        ...payload,
        id: volunteerId,
        userId: volunteerId,
        volunteerId,
        role,
      };

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}


