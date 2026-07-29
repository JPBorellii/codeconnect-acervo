import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { UsersService } from '../src/users/users.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    usersService = app.get(UsersService);
  });

  beforeEach(() => usersService.clearForTests());
  afterAll(() => app?.close());

  const register = (body: object) =>
    request(app.getHttpServer()).post('/auth/register').send(body);
  const credentials = {
    name: '  Maria   Silva ',
    email: ' MARIA@EXAMPLE.COM ',
    password: 'password123',
  };

  it('preserves GET /', () =>
    request(app.getHttpServer()).get('/').expect(200).expect('Hello World!'));

  it('registers normalized users without sensitive fields', async () => {
    const response = await register(credentials).expect(201);
    expect(response.body).toMatchObject({
      name: 'Maria Silva',
      email: 'maria@example.com',
    });
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it.each([
    [{ ...credentials, extra: true }],
    [{ ...credentials, name: ' ' }],
    [{ ...credentials, email: 'invalid' }],
    [{ ...credentials, password: 'short' }],
    [{ ...credentials, password: 'a'.repeat(73) }],
  ])('rejects invalid registration', (body) =>
    register(body)
      .expect(400)
      .expect((response) =>
        expect((response.body as { message: string }).message).toBe(
          'Dados de entrada inválidos',
        ),
      ),
  );

  it('rejects duplicate emails ignoring case', async () => {
    await register(credentials).expect(201);
    await register({ ...credentials, email: 'maria@example.com' }).expect(409);
  });

  it('logs in and retrieves the authenticated user', async () => {
    await register(credentials).expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'maria@example.com', password: credentials.password })
      .expect(200);
    expect(login.body).toMatchObject({
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: { email: 'maria@example.com' },
    });
    const loginBody = login.body as {
      accessToken: string;
      user: { passwordHash?: string };
    };
    expect(loginBody.user).not.toHaveProperty('passwordHash');
    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .expect(200);
    expect((me.body as { email: string }).email).toBe('maria@example.com');
  });

  it('uses a generic message for invalid credentials', async () => {
    await register(credentials).expect(201);
    const missing = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'none@example.com', password: 'password123' })
      .expect(401);
    const wrong = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'maria@example.com', password: 'wrongpass' })
      .expect(401);
    expect((missing.body as { message: string }).message).toBe(
      'Credenciais inválidas',
    );
    expect((wrong.body as { message: string }).message).toBe(
      'Credenciais inválidas',
    );
  });

  it.each([undefined, 'Basic abc', 'Bearer', 'Bearer malformed.token'])(
    'rejects invalid auth headers',
    (authorization) => {
      const call = request(app.getHttpServer()).get('/auth/me');
      return authorization
        ? call.set('Authorization', authorization).expect(401)
        : call.expect(401);
    },
  );

  it('rejects a token signed with another secret', async () => {
    const token = await new JwtService({
      secret: 'another-secret-with-at-least-32-characters',
    }).signAsync({
      sub: 'user-id',
      email: 'maria@example.com',
    });
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('rejects an expired token', async () => {
    const token = await new JwtService({
      secret: process.env.JWT_SECRET,
    }).signAsync(
      { sub: 'user-id', email: 'maria@example.com' },
      { expiresIn: -1 },
    );
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
