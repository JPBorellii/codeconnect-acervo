import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PublicUser, UserRecord } from './users.types';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  private readonly usersById = new Map<string, UserRecord>();
  private readonly userIdByNormalizedEmail = new Map<string, string>();

  create(input: CreateUserInput): PublicUser {
    const email = input.email.toLowerCase();
    if (this.userIdByNormalizedEmail.has(email)) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const user: UserRecord = {
      id: randomUUID(),
      name: input.name,
      email,
      passwordHash: input.passwordHash,
      createdAt: new Date(),
    };
    this.usersById.set(user.id, user);
    this.userIdByNormalizedEmail.set(email, user.id);
    return this.toPublic(user);
  }

  findInternalByEmail(email: string): UserRecord | undefined {
    const id = this.userIdByNormalizedEmail.get(email.toLowerCase());
    return id ? this.usersById.get(id) : undefined;
  }

  findInternalById(id: string): UserRecord | undefined {
    return this.usersById.get(id);
  }

  findPublicById(id: string): PublicUser | undefined {
    const user = this.findInternalById(id);
    return user ? this.toPublic(user) : undefined;
  }

  clearForTests(): void {
    this.usersById.clear();
    this.userIdByNormalizedEmail.clear();
  }

  private toPublic(user: UserRecord): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
