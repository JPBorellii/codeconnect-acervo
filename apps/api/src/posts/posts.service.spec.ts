import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PostEntity } from './entities/post.entity';
import { createExcerpt } from './posts.mapper';
import { PostsService } from './posts.service';

const row = {
  post_id: 'b0000000-0000-4000-8000-000000000001',
  post_title: 'React com TypeScript',
  post_content: 'Conte\u00fado sobre React e TypeScript.',
  post_thumbnail_url: null,
  post_created_at: '2026-01-01T00:00:00.000Z',
  author_id: 'a0000000-0000-4000-8000-000000000001',
  author_name: 'Ada Exemplo',
  post_comment_count: 0,
  post_like_count: 0,
};

describe('PostsService', () => {
  let service: PostsService;
  let builder: {
    innerJoin: jest.Mock;
    select: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    addOrderBy: jest.Mock;
    clone: jest.Mock;
    getCount: jest.Mock;
    offset: jest.Mock;
    limit: jest.Mock;
    getRawMany: jest.Mock;
    getRawOne: jest.Mock;
  };
  let repository: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    builder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      clone: jest.fn(),
      getCount: jest.fn().mockResolvedValue(1),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([row]),
      getRawOne: jest.fn().mockResolvedValue(row),
    };
    builder.clone.mockReturnValue({ getCount: builder.getCount });
    repository = { createQueryBuilder: jest.fn().mockReturnValue(builder) };
    const module = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(PostEntity), useValue: repository },
      ],
    }).compile();
    service = module.get(PostsService);
  });

  it('lists posts with default pagination and stable ordering', async () => {
    await expect(service.list(new ListPostsQueryDto())).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: row.post_id,
          author: { id: row.author_id, name: row.author_name },
          commentCount: 0,
          likeCount: 0,
        }),
      ],
      meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
    expect(builder.offset).toHaveBeenCalledWith(0);
    expect(builder.limit).toHaveBeenCalledWith(12);
    expect(builder.orderBy).toHaveBeenCalledWith('post.created_at', 'DESC');
    expect(builder.addOrderBy).toHaveBeenCalledWith('post.id', 'DESC');
  });

  it('returns valid metadata for an empty page', async () => {
    builder.getCount.mockResolvedValue(0);
    builder.getRawMany.mockResolvedValue([]);
    await expect(
      service.list(
        Object.assign(new ListPostsQueryDto(), { page: 3, limit: 5 }),
      ),
    ).resolves.toEqual({
      items: [],
      meta: { page: 3, limit: 5, total: 0, totalPages: 0 },
    });
  });

  it('lists only an author posts with the public pagination contract', async () => {
    const authorId = 'a0000000-0000-4000-8000-000000000001';
    await expect(
      service.listByAuthorId(
        authorId,
        Object.assign(new ListPostsQueryDto(), { page: 2, limit: 5 }),
      ),
    ).resolves.toMatchObject({
      items: [
        {
          author: { id: authorId, name: row.author_name },
          commentCount: 0,
          likeCount: 0,
        },
      ],
      meta: { page: 2, limit: 5, total: 1, totalPages: 1 },
    });
    expect(builder.andWhere).toHaveBeenCalledWith(
      'post.author_id = :authorId',
      {
        authorId,
      },
    );
    expect(builder.orderBy).toHaveBeenCalledWith('post.created_at', 'DESC');
    expect(builder.addOrderBy).toHaveBeenCalledWith('post.id', 'DESC');
  });

  it('binds search text as a parameter instead of interpolating it', async () => {
    const q = "react ' | injection";
    await service.list(Object.assign(new ListPostsQueryDto(), { q }));
    expect(builder.where).toHaveBeenCalledWith(
      expect.stringContaining('websearch_to_tsquery'),
      { q },
    );
    const [condition] = builder.where.mock.calls[0] as [string, unknown];
    expect(condition).not.toContain(q);
    expect(builder.orderBy).toHaveBeenCalledWith(
      expect.stringContaining('ts_rank'),
      'DESC',
    );
  });

  it('maps existing detail without internal author fields', async () => {
    await expect(service.findDetail(row.post_id)).resolves.toEqual(
      expect.objectContaining({
        id: row.post_id,
        content: row.post_content,
        author: { id: row.author_id, name: row.author_name },
      }),
    );
  });

  it('returns 404 when detail does not exist', async () => {
    builder.getRawOne.mockResolvedValue(undefined);
    await expect(service.findDetail(row.post_id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('createExcerpt', () => {
  it('normalizes presentation whitespace without truncating short text', () => {
    expect(createExcerpt('  Ol\u00e1\n mundo  ')).toBe('Ol\u00e1 mundo');
  });

  it('truncates Unicode by code point and adds ellipsis only when needed', () => {
    const emoji = String.fromCodePoint(0x1f600);
    const ellipsis = String.fromCodePoint(0x2026);
    const value = `${emoji.repeat(240)}fim`;
    expect(createExcerpt(value)).toBe(`${emoji.repeat(240)}${ellipsis}`);
  });
});
