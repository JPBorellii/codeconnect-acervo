import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest, JwtClaims } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string'
        ? /^Bearer ([^\s]+)$/i.exec(authorization)
        : null;

    if (!match) {
      throw new UnauthorizedException('Não autorizado');
    }

    try {
      const payload: unknown = await this.jwtService.verifyAsync(match[1]);
      if (!this.isJwtClaims(payload)) {
        throw new Error('Invalid JWT claims');
      }
      request.auth = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Não autorizado');
    }
  }

  private isJwtClaims(payload: unknown): payload is JwtClaims {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      typeof (payload as JwtClaims).sub === 'string' &&
      typeof (payload as JwtClaims).email === 'string'
    );
  }
}
