import { ApiProperty } from '@nestjs/swagger';

export class PublicUserResponseDto {
  @ApiProperty({ example: '672bf811-3e49-4bf8-95ae-8574ccce943a' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 'maria@example.com' })
  email!: string;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z' })
  createdAt!: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({ example: 3600 })
  expiresIn!: number;

  @ApiProperty({ type: PublicUserResponseDto })
  user!: Omit<PublicUserResponseDto, 'createdAt'>;
}

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Dados de entrada inválidos' })
  message!: string;

  @ApiProperty({ example: ['email must be an email'] })
  errors!: string[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode!: number;

  @ApiProperty({ example: 'Não autorizado' })
  message!: string;
}

export class ConflictErrorResponseDto {
  @ApiProperty({ example: 409 })
  statusCode!: number;

  @ApiProperty({ example: 'E-mail já cadastrado' })
  message!: string;
}
