import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, JwtClaims } from './auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtClaims =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().auth,
);
