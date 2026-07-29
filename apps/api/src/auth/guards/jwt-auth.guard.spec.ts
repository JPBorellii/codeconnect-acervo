import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../auth.types';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let jwtService: jest.Mocked<Pick<JwtService, 'verifyAsync'>>;
  let guard: JwtAuthGuard;

  function contextFor(authorization?: string): {
    context: ExecutionContext;
    request: AuthenticatedRequest;
  } {
    const request = {
      headers: authorization ? { authorization } : {},
    } as AuthenticatedRequest;
    return {
      request,
      context: {
        switchToHttp: () => ({ getRequest: <T>() => request as T }),
      } as ExecutionContext,
    };
  }

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    guard = new JwtAuthGuard(jwtService as JwtService);
  });

  it.each([undefined, '', 'Basic token', 'Bearer', 'Bearer one two'])(
    'rejects invalid Authorization header %p',
    async (authorization) => {
      const { context } = contextFor(authorization);
      await expect(guard.canActivate(context)).rejects.toMatchObject<
        Partial<UnauthorizedException>
      >({
        message: 'Não autorizado',
        status: 401,
      });
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    },
  );

  it.each([new Error('invalid token details'), new Error('jwt expired')])(
    'keeps JWT failures generic',
    async (error) => {
      jwtService.verifyAsync.mockRejectedValue(error);
      const { context } = contextFor('Bearer token');
      await expect(guard.canActivate(context)).rejects.toMatchObject<
        Partial<UnauthorizedException>
      >({
        message: 'Não autorizado',
        status: 401,
      });
    },
  );

  it.each([
    {},
    { sub: 1, email: 'maria@example.com' },
    { sub: 'user-id' },
    { sub: 'user-id', email: 1 },
  ])('rejects invalid JWT claims', async (payload) => {
    jwtService.verifyAsync.mockResolvedValue(payload);
    const { context } = contextFor('Bearer token');
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it.each(['bearer', 'BEARER'])(
    'accepts case-insensitive %s scheme',
    async (scheme) => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'maria@example.com',
      });
      const { context, request } = contextFor(`${scheme} token`);
      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(request.auth).toEqual({
        sub: 'user-id',
        email: 'maria@example.com',
      });
    },
  );
});
