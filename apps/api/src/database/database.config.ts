import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { existsSync, readFileSync } from 'node:fs';
import { DataSourceOptions } from 'typeorm';
import { CreateUsers1785312000000 } from './migrations/1785312000000-CreateUsers';
import { CreatePosts1785398400000 } from './migrations/1785398400000-CreatePosts';
import { PostEntity } from '../posts/entities/post.entity';
import { UserEntity } from '../users/entities/user.entity';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

type Environment = Record<string, unknown>;

export function loadEnvironmentFile(path: string): void {
  if (!existsSync(path)) {
    return;
  }

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (line.trim().length === 0 || line.trimStart().startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    if (key.length > 0 && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getRequiredString(environment: Environment, key: string): string {
  const value = environment[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid environment configuration: ${key}`);
  }
  return value;
}

function getPort(environment: Environment, key: string): number {
  const value = Number(getRequiredString(environment, key));
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Invalid environment configuration: ${key}`);
  }
  return value;
}

export function createDatabaseConfig(environment: Environment): DatabaseConfig {
  const isTest = environment.NODE_ENV === 'test';
  const prefix = isTest ? 'TEST_DB_' : 'DB_';
  const config: DatabaseConfig = {
    host: getRequiredString(environment, `${prefix}HOST`),
    port: getPort(environment, `${prefix}PORT`),
    database: getRequiredString(environment, `${prefix}NAME`),
    username: getRequiredString(environment, `${prefix}USER`),
    password: getRequiredString(environment, `${prefix}PASSWORD`),
  };

  if (
    isTest &&
    (config.database !== 'codeconnect_test' || config.port !== 5433)
  ) {
    throw new Error(
      'Invalid test database configuration: TEST_DB_NAME must be codeconnect_test and TEST_DB_PORT must be 5433',
    );
  }

  return config;
}

export function createTypeOrmOptions(
  environment: Environment,
): TypeOrmModuleOptions & DataSourceOptions {
  const database = createDatabaseConfig(environment);

  return {
    type: 'postgres',
    ...database,
    synchronize: false,
    migrationsRun: false,
    logging: false,
    retryAttempts: 5,
    retryDelay: 3000,
    connectTimeoutMS: 5000,
    entities: [UserEntity, PostEntity],
    migrations: [CreateUsers1785312000000, CreatePosts1785398400000],
  };
}
