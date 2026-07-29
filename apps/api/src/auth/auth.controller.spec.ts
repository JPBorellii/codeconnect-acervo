import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('AuthController OpenAPI document', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: JwtAuthGuard, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(() => app?.close());

  it('documents the duplicate registration conflict example', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    const response = document.paths['/auth/register'].post?.responses?.['409'];
    const schema = document.components?.schemas?.ConflictErrorResponseDto;

    expect(response).toMatchObject({
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ConflictErrorResponseDto' },
        },
      },
    });
    expect(schema).toMatchObject({
      properties: {
        statusCode: { example: 409 },
        message: { example: 'E-mail já cadastrado' },
      },
    });
  });
});
