import * as bcrypt from 'bcrypt';
import { In } from 'typeorm';
import dataSource from '../data-source';
import { PostEntity } from '../../posts/entities/post.entity';
import { UserEntity } from '../../users/entities/user.entity';

const authors = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    name: 'Ada Exemplo',
    email: 'ada.seed@example.com',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    name: 'Linus Exemplo',
    email: 'linus.seed@example.com',
  },
];
const posts = Array.from({ length: 10 }, (_, index) => ({
  id: `b0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  authorId: authors[index % authors.length].id,
  title: `Prática ${index + 1}: fundamentos de desenvolvimento web`,
  content: `Conteúdo determinístico do post ${index + 1} sobre TypeScript, React e boas práticas de desenvolvimento.`,
  thumbnailUrl:
    index % 3 === 0
      ? null
      : `https://images.example.com/codeconnect-${index + 1}.jpg`,
  createdAt: new Date(
    `2026-01-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`,
  ),
}));
const bcryptHashPattern = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

function assertDevelopmentDatabase(): void {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test')
    throw new Error('Seed de posts permitido somente em desenvolvimento');
  if (process.env.DB_NAME !== 'codeconnect' || process.env.DB_PORT !== '5432')
    throw new Error('Seed de posts requer o banco codeconnect na porta 5432');
}

function assertSeedAuthor(
  author: (typeof authors)[number],
  passwordHash: string,
): void {
  if (
    !author.id ||
    !author.name ||
    !author.email ||
    !passwordHash ||
    !bcryptHashPattern.test(passwordHash)
  ) {
    throw new Error('Dados de autor do seed inválidos');
  }
}

async function seed(): Promise<void> {
  assertDevelopmentDatabase();
  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      const users = manager.getRepository(UserEntity);
      const existingAuthors = await users.findBy({
        id: In(authors.map(({ id }) => id)),
      });
      for (const author of existingAuthors) {
        const expected = authors.find(({ id }) => id === author.id);
        if (
          !expected ||
          author.name !== expected.name ||
          author.email !== expected.email
        )
          throw new Error('Autor determinístico existente é incompatível');
      }
      const missingAuthors = authors.filter(
        (author) => !existingAuthors.some(({ id }) => id === author.id),
      );
      if (missingAuthors.length > 0) {
        const passwordHash = await bcrypt.hash(
          'seed-only-not-a-real-user-password',
          12,
        );
        missingAuthors.forEach((author) =>
          assertSeedAuthor(author, passwordHash),
        );
        await users.insert(
          missingAuthors.map((author) => ({
            ...author,
            passwordHash,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          })),
        );
      }
      await manager.getRepository(PostEntity).upsert(posts, ['id']);
    });
    process.stdout.write(
      `Seed de posts concluído: ${authors.length} autores e ${posts.length} posts.\n`,
    );
  } finally {
    await dataSource.destroy();
  }
}

void seed().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Falha ao executar seed'}\n`,
  );
  process.exitCode = 1;
});
