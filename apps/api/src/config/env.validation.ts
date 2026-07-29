import { plainToInstance, Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import { createDatabaseConfig } from '../database/database.config';

class EnvironmentVariables {
  @Transform(({ value }) => Number(value ?? 3000))
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_SECRET!: string;

  @Transform(({ value }) => Number(value ?? 3600))
  @IsInt()
  @Min(1)
  JWT_EXPIRES_IN = 3600;

  @Transform(({ value }) => Number(value ?? 12))
  @IsInt()
  @Min(4)
  @Max(15)
  BCRYPT_ROUNDS = 12;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const environment = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });
  const errors = validateSync(environment, { skipMissingProperties: false });
  const isTest = config.NODE_ENV === 'test';
  const rounds = environment.BCRYPT_ROUNDS;

  if (!isTest && rounds < 10) {
    throw new Error(
      'Invalid environment configuration: BCRYPT_ROUNDS must be between 10 and 15',
    );
  }

  if (errors.length > 0) {
    const fields = errors.map((error) => error.property).join(', ');
    throw new Error(`Invalid environment configuration: ${fields}`);
  }

  createDatabaseConfig(config);

  return environment;
}
