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

  private getSecrets(): string[] {
    const configuredSecret = process.env.JWT_SECRET?.trim();
    const secrets = [configuredSecret, 'dev-secret'];

    return secrets.filter((secret): secret is string => Boolean(secret));
  }

  private extractToken(req: Request & { user?: any; cookies?: Record<string, string> }): string | undefined {
    const headerValue = req.headers.authorization ?? (req.headers as any).Authorization;
    const cookieToken = req.cookies?.accessToken ?? req.cookies?.token;
    const fallbackToken = (req.headers['x-access-token'] as string | undefined) ?? (req.headers['access_token'] as string | undefined);

    const rawToken = headerValue ?? fallbackToken ?? cookieToken;
    if (!rawToken || typeof rawToken !== 'string') {
      return undefined;
    }

    const trimmedToken = rawToken.trim().replace(/^['\"]|['\"]$/g, '');
    const [scheme, token] = trimmedToken.split(' ');

    if (!token) {
      return trimmedToken;
    }

    if (scheme.toLowerCase() === 'bearer') {
      return token.trim().replace(/^['\"]|['\"]$/g, '');
    }

    return trimmedToken;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();
    if (req.user?.role === 'VOLUNTEER' && req.user?.id) {
      return true;
    }

    const token = this.extractToken(req as Request & { user?: any; cookies?: Record<string, string> });

    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    try {
      let payload: any;
      let lastError: unknown;

      for (const secret of this.getSecrets()) {
        try {
          payload = await this.jwtService.verifyAsync(token, { secret });
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!payload) {
        throw lastError instanceof Error ? lastError : new UnauthorizedException('Invalid or expired token');
      }

      const role = payload.role ?? payload.userRole;
      const volunteerId = Number(payload.volunteerId ?? payload.userId ?? payload.id ?? payload.sub);

      if (role !== 'VOLUNTEER') {
        throw new ForbiddenException('Only volunteer accounts can access this route');
      }

      if (!Number.isFinite(volunteerId) || volunteerId <= 0) {
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


