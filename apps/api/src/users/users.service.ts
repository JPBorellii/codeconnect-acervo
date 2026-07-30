import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { PublicUser, UserRecord } from './users.types';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(input: CreateUserInput): Promise<PublicUser> {
    const user = this.usersRepository.create({
      id: randomUUID(),
      name: input.name,
      email: input.email.trim().toLowerCase(),
      passwordHash: input.passwordHash,
    });

    try {
      return this.toPublic(await this.usersRepository.save(user));
    } catch (error: unknown) {
      if (this.isDuplicateEmailError(error)) {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw error;
    }
  }

  async findInternalByEmail(email: string): Promise<UserRecord | undefined> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.passwordHash',
        'user.createdAt',
      ])
      .where('user.email = :email', { email: email.trim().toLowerCase() })
      .getOne();

    return user ? this.toInternal(user) : undefined;
  }

  async findInternalById(id: string): Promise<UserRecord | undefined> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.passwordHash',
        'user.createdAt',
      ])
      .where('user.id = :id', { id })
      .getOne();

    return user ? this.toInternal(user) : undefined;
  }

  async findPublicById(id: string): Promise<PublicUser | undefined> {
    const user = await this.usersRepository.findOneBy({ id });
    return user ? this.toPublic(user) : undefined;
  }

  private toInternal(user: UserEntity): UserRecord {
    if (typeof user.passwordHash !== 'string') {
      throw new InternalServerErrorException();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    };
  }

  private toPublic(user: UserRecord): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private isDuplicateEmailError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const databaseError = error as { code?: unknown; constraint?: unknown };
    return (
      databaseError.code === '23505' &&
      databaseError.constraint === 'users_email_unique'
    );
  }
}
