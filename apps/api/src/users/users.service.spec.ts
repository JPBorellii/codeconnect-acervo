import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const user: UserEntity = {
    id: 'b1e8d278-490b-4ba7-8c7b-bc5faf65c1bd',
    name: 'Maria Silva',
    email: 'maria@example.com',
    passwordHash: 'hashed-password',
    createdAt,
  };
  let service: UsersService;
  let repository: jest.Mocked<
    Pick<Repository<UserEntity>, 'create' | 'save' | 'findOneBy'>
  > & {
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: repository },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('creates a UUID user with normalized email and only public fields', async () => {
    repository.create.mockReturnValue(user);
    repository.save.mockResolvedValue(user);

    const result = await service.create({
      name: user.name,
      email: ' MARIA@EXAMPLE.COM ',
      passwordHash: user.passwordHash,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      }),
    );
    expect(repository.create.mock.calls[0]?.[0]?.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(repository.save).toHaveBeenCalled();
    expect(result).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: createdAt.toISOString(),
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('loads the password hash explicitly for normalized email lookups', async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(user),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(
      service.findInternalByEmail(' MARIA@EXAMPLE.COM '),
    ).resolves.toEqual(user);
    expect(queryBuilder.select).toHaveBeenCalledWith(
      expect.arrayContaining(['user.passwordHash']),
    );
    expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', {
      email: user.email,
    });
  });

  it('returns undefined when an internal email lookup does not find a user', async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(
      service.findInternalByEmail(user.email),
    ).resolves.toBeUndefined();
  });

  it('finds internal users by id and public users without the hash', async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(user),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    repository.findOneBy.mockResolvedValue(user);

    await expect(service.findInternalById(user.id)).resolves.toEqual(user);
    await expect(service.findPublicById(user.id)).resolves.toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: createdAt.toISOString(),
    });
  });

  it('converts only the users email constraint violation to a conflict', async () => {
    repository.create.mockReturnValue(user);
    repository.save.mockRejectedValue({
      code: '23505',
      constraint: 'users_email_unique',
    });

    await expect(
      service.create({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('propagates unrelated database errors', async () => {
    const error = { code: '23505', constraint: 'another_unique_constraint' };
    repository.create.mockReturnValue(user);
    repository.save.mockRejectedValue(error);

    await expect(
      service.create({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      }),
    ).rejects.toBe(error);
  });
});
