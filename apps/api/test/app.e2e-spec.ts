import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { createDatabaseConfig } from '../src/database/database.config';
import dataSource from '../src/database/data-source';
import { setupApp } from '../src/app.setup';
import { UserEntity } from '../src/users/entities/user.entity';
import { PostEntity } from '../src/posts/entities/post.entity';
import { randomUUID } from 'node:crypto';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  beforeAll(async () => {
    await dataSource.initialize();
    await dataSource.runMigrations();
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  beforeEach(async () => {
    const database = createDatabaseConfig(process.env);
    if (
      process.env.NODE_ENV !== 'test' ||
      database.database !== 'codeconnect_test' ||
      database.port !== 5433
    ) {
      throw new Error('Refusing to clear a non-test database');
    }

    await dataSource.getRepository(PostEntity).clear();
    await dataSource
      .getRepository(UserEntity)
      .createQueryBuilder()
      .delete()
      .execute();
  });

  afterAll(async () => {
    await app?.close();
    await dataSource.destroy();
  });

  const register = (body: object) =>
    request(app.getHttpServer()).post('/auth/register').send(body);
  const credentials = {
    name: '  Maria   Silva ',
    email: ' MARIA@EXAMPLE.COM ',
    password: 'password123',
  };

  async function createPost(overrides: Partial<PostEntity> = {}) {
    const user = await register({
      ...credentials,
      email: `post-${randomUUID()}@example.com`,
    }).expect(201);
    const createdUser = user.body as unknown as { id: string };
    return dataSource.getRepository(PostEntity).save({
      id: randomUUID(),
      authorId: createdUser.id,
      title: 'React e TypeScript',
      content: 'Conte\u00fado pesquis\u00e1vel sobre desenvolvimento frontend.',
      thumbnailUrl: null,
      ...overrides,
    });
  }

  it('preserves GET /', () =>
    request(app.getHttpServer()).get('/').expect(200).expect('Hello World!'));

  it('documents only the public posts read endpoints without mojibake', () => {
    const document: OpenAPIObject = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth(undefined, 'bearer').build(),
    );
    expect(document.paths['/']?.get).toBeDefined();
    expect(document.paths['/auth/register']?.post).toBeDefined();
    expect(document.paths['/auth/login']?.post).toBeDefined();
    expect(document.paths['/auth/me']?.get).toBeDefined();
    expect(document.paths['/posts']?.get).toBeDefined();
    expect(document.paths['/posts/{id}']?.get).toBeDefined();

    expect(document.paths['/auth/me']?.get?.security).toEqual([{ bearer: [] }]);
    expect(document.paths['/posts']?.get?.security ?? []).toHaveLength(0);
    expect(document.paths['/posts/{id}']?.get?.security ?? []).toHaveLength(0);

    expect(document.paths['/posts']?.post).toBeUndefined();

    const paths = Object.keys(document.paths);

    expect(paths.some((path) => path.includes('/comments'))).toBe(false);
    expect(paths.some((path) => path.includes('/likes'))).toBe(false);

    const serializedDocument = JSON.stringify(document);
    const mojibakePattern = /[\u00c3\u00c2\ufffd]/u;

    expect(serializedDocument).not.toMatch(mojibakePattern);
  });

  it('registers normalized users without sensitive fields', async () => {
    const response = await register(credentials).expect(201);
    expect(response.body).toMatchObject({
      name: 'Maria Silva',
      email: 'maria@example.com',
    });
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('passwordHash');
    await expect(
      dataSource.getRepository(UserEntity).findOneBy({
        email: 'maria@example.com',
      }),
    ).resolves.toMatchObject({
      name: 'Maria Silva',
      email: 'maria@example.com',
    });
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
          'Dados de entrada inv\u00e1lidos',
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
    expect(me.headers['cache-control']).toBe('no-store');
    expect(me.headers.pragma).toBe('no-cache');
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
      'Credenciais inv\u00e1lidas',
    );
    expect((wrong.body as { message: string }).message).toBe(
      'Credenciais inv\u00e1lidas',
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

  it('lists public posts without a token using the default pagination contract', async () => {
    await createPost();
    const response = await request(app.getHttpServer())
      .get('/posts')
      .expect(200);
    const body = response.body as unknown as {
      items: Array<{
        author: { name: string };
        title: string;
        commentCount: number;
        likeCount: number;
      }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    };
    expect(body).toMatchObject({
      meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
    expect(body.items[0]).toMatchObject({
      title: 'React e TypeScript',
      commentCount: 0,
      likeCount: 0,
      author: { name: 'Maria Silva' },
    });
    expect(body.items[0].author).not.toHaveProperty('email');
    expect(body.items[0]).not.toHaveProperty('passwordHash');
  });

  it('paginates public posts with stable created_at and id ordering', async () => {
    const createdAt = new Date('2026-02-01T00:00:00.000Z');
    await createPost({
      id: 'b0000000-0000-4000-8000-000000000001',
      title: 'Primeiro',
      createdAt,
    });
    await createPost({
      id: 'b0000000-0000-4000-8000-000000000002',
      title: 'Segundo',
      createdAt,
    });
    const response = await request(app.getHttpServer())
      .get('/posts?page=1&limit=1')
      .expect(200);
    const body = response.body as unknown as {
      items: Array<{ id: string }>;
      meta: unknown;
    };
    expect(body.meta).toEqual({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
    expect(body.items[0].id).toBe('b0000000-0000-4000-8000-000000000002');
    await request(app.getHttpServer())
      .get('/posts?page=3&limit=1')
      .expect(200)
      .expect({
        items: [],
        meta: { page: 3, limit: 1, total: 2, totalPages: 2 },
      });
  });

  it('searches title and content safely through PostgreSQL full-text search', async () => {
    await createPost({
      title: 'Guia de React',
      content: 'Aprenda observabilidade em aplica\u00e7\u00f5es.',
    });
    const response = await request(app.getHttpServer())
      .get('/posts?q=React')
      .expect(200);
    const body = response.body as unknown as { items: unknown[] };
    expect(body.items).toHaveLength(1);
    const contentResponse = await request(app.getHttpServer())
      .get('/posts?q=observabilidade')
      .expect(200);
    const contentBody = contentResponse.body as unknown as { items: unknown[] };
    expect(contentBody.items).toHaveLength(1);
    await request(app.getHttpServer())
      .get('/posts?q=%22%20%7C%20%26')
      .expect(200);
  });

  it('returns public details and validates absent or invalid posts', async () => {
    const post = await createPost();
    const response = await request(app.getHttpServer())
      .get(`/posts/${post.id}`)
      .expect(200);
    const body = response.body as unknown as {
      author: object;
      id: string;
      content: string;
      commentCount: number;
      likeCount: number;
    };
    expect(body).toMatchObject({
      id: post.id,
      content: post.content,
      commentCount: 0,
      likeCount: 0,
    });
    expect(body.author).not.toHaveProperty('email');
    await request(app.getHttpServer())
      .get(`/posts/${randomUUID()}`)
      .expect(404);
    await request(app.getHttpServer()).get('/posts/not-a-uuid').expect(400);
  });
});
