import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PublicUser, UserRecord } from '../users/users.types';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const user: UserRecord = {
    id: 'user-id',
    name: 'Maria Silva',
    email: 'maria@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };
  const publicUser: PublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
  let usersService: jest.Mocked<
    Pick<UsersService, 'create' | 'findInternalByEmail'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'getOrThrow'>>;
  let service: AuthService;
  const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findInternalByEmail: jest.fn(),
    };
    jwtService = { signAsync: jest.fn() };
    configService = { getOrThrow: jest.fn() };
    service = new AuthService(
      usersService as UsersService,
      jwtService as JwtService,
      configService as ConfigService,
    );
  });

  it('hashes the password and creates a public user', async () => {
    bcryptMock.hash.mockResolvedValue('hashed-password');
    configService.getOrThrow.mockReturnValue(12);
    usersService.create.mockResolvedValue(publicUser);

    await expect(
      service.register({
        name: user.name,
        email: user.email,
        password: 'password123',
      }),
    ).resolves.toEqual(publicUser);
    expect(usersService.create).toHaveBeenCalledWith({
      name: user.name,
      email: user.email,
      passwordHash: 'hashed-password',
    });
  });

  it('returns a Bearer JWT and public user for valid credentials', async () => {
    usersService.findInternalByEmail.mockResolvedValue(user);
    bcryptMock.compare.mockResolvedValue(true);
    configService.getOrThrow.mockReturnValue(3600);
    jwtService.signAsync.mockResolvedValue('access-token');

    const result = await service.login({
      email: user.email,
      password: 'password123',
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      user.passwordHash,
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
    expect(result).toEqual({
      accessToken: 'access-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: { id: user.id, name: user.name, email: user.email },
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('uses the same generic error for an absent user and an incorrect password', async () => {
    usersService.findInternalByEmail
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(user);
    bcryptMock.compare.mockResolvedValue(false);

    const absent = service.login({
      email: 'missing@example.com',
      password: 'password123',
    });
    const incorrect = service.login({
      email: user.email,
      password: 'incorrect',
    });

    await expect(absent).rejects.toMatchObject<Partial<UnauthorizedException>>({
      message: 'Credenciais inválidas',
      status: 401,
    });
    await expect(incorrect).rejects.toMatchObject<
      Partial<UnauthorizedException>
    >({
      message: 'Credenciais inválidas',
      status: 401,
    });
  });
});
